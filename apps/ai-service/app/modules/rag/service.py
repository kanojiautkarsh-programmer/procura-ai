import json
import logging
import uuid
from typing import Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.llm import get_embeddings, get_llm
from app.core.database import get_db

logger = logging.getLogger(__name__)


def _get_embedding(text: str, api_key: str | None = None) -> list[float]:
    """Generate embedding vector for text."""
    emb = get_embeddings(api_key=api_key)
    vector = emb.embed_query(text)
    return vector


async def ingest_document(
    content: str,
    source: str,
    organization_id: str,
    source_id: str = "",
    metadata: dict | None = None,
) -> int:
    """Split document into chunks, embed, and store in pgvector."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(content)
    doc_id_base = source_id or str(uuid.uuid4())

    with get_db() as conn:
        with conn.cursor() as cur:
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id_base}_{i}"
                embedding = _get_embedding(chunk)
                meta = json.dumps(metadata or {})
                cur.execute(
                    """
                    INSERT INTO document_embeddings
                        (id, content, metadata, source, source_id, organization_id, chunk_index, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector)
                    ON CONFLICT (id) DO UPDATE
                        SET content = EXCLUDED.content,
                            updated_at = NOW()
                    """,
                    (chunk_id, chunk, meta, source, source_id, organization_id, i, embedding),
                )
        conn.commit()

    logger.info(f"Ingested {len(chunks)} chunks from {source}")
    return len(chunks)


async def query_documents(
    query: str,
    organization_id: str,
    top_k: int = 5,
    api_key: str | None = None,
) -> list[dict]:
    """Search for relevant document chunks using vector similarity."""
    embedding = _get_embedding(query)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT content, metadata, source, source_id, chunk_index,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM document_embeddings
                WHERE organization_id = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (embedding, organization_id, embedding, top_k),
            )
            rows = cur.fetchall()

    return [
        {
            "content": row["content"],
            "metadata": row["metadata"],
            "source": row["source"],
            "source_id": row["source_id"],
            "chunk_index": row["chunk_index"],
            "similarity": round(float(row["similarity"]), 4),
        }
        for row in rows
    ]


async def generate_procurement_answer(
    query: str,
    organization_id: str,
    top_k: int = 5,
    api_key: str | None = None,
) -> str:
    """Generate an answer using RAG: retrieve context + LLM generation."""
    docs = await query_documents(query, organization_id, top_k, api_key=api_key)

    if not docs:
        llm = get_llm(api_key=api_key)
        prompt = f"""You are a procurement assistant. Answer this question based on general knowledge:

Question: {query}

If you don't know, say so. Keep answers concise and actionable."""
        response = await llm.ainvoke(prompt)
        return response.content

    context = "\n\n".join(
        f"[{d['source']}] {d['content'][:500]}"
        for d in docs
    )

    llm = get_llm(api_key=api_key)
    prompt = f"""You are a procurement AI assistant. Answer the question using ONLY the provided context.

Context:
{context}

Question: {query}

Provide a concise, actionable answer based on the context. If the context doesn't contain enough info, say so."""

    response = await llm.ainvoke(prompt)
    return response.content
