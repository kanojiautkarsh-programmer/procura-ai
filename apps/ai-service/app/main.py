from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import ocr, categorize, rag, spend, forecasting, health
from app.routers import negociation
from app.core.config import settings

app = FastAPI(
    title="Procura AI Service",
    description="AI microservice for OCR, categorization, RAG, and spend detection",
    version="0.1.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

FRONTEND_URL = settings.frontend_url or "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Internal-Token", "X-API-Key"],
)


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/v1/health"):
        return await call_next(request)

    auth = request.headers.get("Authorization", "")
    internal_token = request.headers.get("X-Internal-Token", "")
    api_key_header = request.headers.get("X-API-Key", "")

    authorized = False

    if settings.api_key and (api_key_header == settings.api_key or auth == f"Bearer {settings.api_key}"):
        authorized = True

    if settings.internal_api_token and internal_token == settings.internal_api_token:
        authorized = True

    if not authorized and request.method == "POST":
        try:
            body = await request.json()
            if body.get("api_key"):
                authorized = True
        except Exception:
            pass

    if not authorized:
        return JSONResponse(status_code=401, content={"detail": "Missing or invalid API key"})

    return await call_next(request)


app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["ocr"])
app.include_router(categorize.router, prefix="/api/v1/categorize", tags=["categorize"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["rag"])
app.include_router(spend.router, prefix="/api/v1/spend", tags=["spend"])
app.include_router(forecasting.router, prefix="/api/v1/forecast", tags=["forecast"])
app.include_router(negociation.router)
