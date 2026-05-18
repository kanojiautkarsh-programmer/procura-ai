from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.modules.rag.service import ingest_document, query_documents, generate_procurement_answer

router = APIRouter()


class IngestRequest(BaseModel):
    content: str
    source: str
    source_id: str = ""
    organization_id: str
    metadata: dict = {}


class QueryRequest(BaseModel):
    query: str
    organization_id: str
    top_k: int = 5


@router.post("/ingest")
async def ingest(req: IngestRequest):
    chunk_count = await ingest_document(
        content=req.content,
        source=req.source,
        source_id=req.source_id,
        organization_id=req.organization_id,
        metadata=req.metadata,
    )
    return {"ingested": True, "chunks": chunk_count}


@router.post("/query")
async def query(req: QueryRequest):
    results = await query_documents(
        query=req.query,
        organization_id=req.organization_id,
        top_k=req.top_k,
    )
    return {"results": results}


@router.post("/ask")
async def ask(req: QueryRequest):
    answer = await generate_procurement_answer(
        query=req.query,
        organization_id=req.organization_id,
        top_k=req.top_k,
    )
    return {"answer": answer}


@router.post("/categorize-policy")
async def categorize_with_policy(req: QueryRequest):
    """Ask a procurement policy question using RAG on org's policy documents."""
    answer = await generate_procurement_answer(
        query=req.query,
        organization_id=req.organization_id,
        top_k=req.top_k,
    )
    return {"answer": answer}
