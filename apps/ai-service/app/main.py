from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ocr, categorize, rag, spend, health

app = FastAPI(
    title="Procura AI Service",
    description="AI microservice for OCR, categorization, RAG, and spend detection",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["ocr"])
app.include_router(categorize.router, prefix="/api/v1/categorize", tags=["categorize"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["rag"])
app.include_router(spend.router, prefix="/api/v1/spend", tags=["spend"])
