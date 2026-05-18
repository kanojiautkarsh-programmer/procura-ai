from fastapi import APIRouter

from app.modules.negociation.service import generate_negotiation_suggestions, batch_negotiation_suggestions

router = APIRouter(prefix="/api/v1/negotiation", tags=["negotiation"])


@router.post("/suggestions")
async def suggestions(payload: dict):
    """
    Generate negotiation suggestions for a single vendor.

    Expected payload:
    {
        "vendorName": "Vendor Inc.",
        "category": "saas",
        "currentSpend": 50000,
        "contractValue": 120000,
        "currentDiscount": 3,
        "contractTermMonths": 12,
        "seats": 50,
        "usagePercentage": 65,
        "renewalDate": "2026-06-01",
        "overlappingTools": [...],
        "competitorPricing": {...}
    }
    """
    result = generate_negotiation_suggestions(payload)
    return {"success": True, "data": result}


@router.post("/batch")
async def batch_suggestions(payload: dict):
    """
    Generate negotiation suggestions for multiple vendors.

    Expected payload: { "vendors": [...] }
    """
    vendors = payload.get("vendors", [])
    results = await batch_negotiation_suggestions(vendors)
    return {"success": True, "data": results}
