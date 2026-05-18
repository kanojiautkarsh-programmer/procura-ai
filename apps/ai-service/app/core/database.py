import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from .config import settings


def get_connection():
    return psycopg2.connect(settings.database_url, cursor_factory=RealDictCursor)


def init_db():
    """Create pgvector extension and embeddings table if not exists."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS document_embeddings (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    metadata JSONB,
                    source TEXT NOT NULL,
                    source_id TEXT,
                    organization_id TEXT NOT NULL,
                    chunk_index INT DEFAULT 0,
                    embedding vector(1536),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_doc_embedding_org
                ON document_embeddings (organization_id)
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_doc_embedding_vector
                ON document_embeddings
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            """)
        conn.commit()


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()
