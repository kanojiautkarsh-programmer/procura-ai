from fastapi import APIRouter

from app.modules.negociation.service import generate_negotiation_suggestions, batch_negotiation_suggestions

router = APIRouter(prefix="/api/v1/negotiation", tags=["negotiation"])


@router.post("/suggestions")
async def suggestions(payload: dict):
    result = generate_negotiation_suggestions(payload)
    return {"success": True, "data": result}


@router.post("/batch")
async def batch_suggestions(payload: dict):
    vendors = payload.get("vendors", [])
    results = await batch_negotiation_suggestions(vendors)
    return {"success": True, "data": results}
