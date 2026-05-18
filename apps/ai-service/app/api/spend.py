from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.modules.spend.service import (
    detect_inactive_subscriptions,
    detect_overlapping_tools,
    generate_optimization_recommendations,
)

router = APIRouter()


class SpendAnalysisRequest(BaseModel):
    organization_id: str
    subscriptions: list[dict] = []
    invoices: list[dict] = []


@router.post("/optimize")
async def analyze_spend(req: SpendAnalysisRequest):
    inactive = await detect_inactive_subscriptions(req.subscriptions)
    overlaps = detect_overlapping_tools(req.subscriptions)
    recommendations = await generate_optimization_recommendations(
        inactive, overlaps, req.subscriptions
    )

    total_savings = sum(r.get("estimated_savings", 0) for r in recommendations)

    return {
        "inactive_licenses": len(inactive),
        "overlapping_tools": len(overlaps),
        "recommendations": recommendations,
        "total_estimated_savings": total_savings,
    }


@router.post("/detect-inactive")
async def detect_inactive(req: SpendAnalysisRequest):
    inactive = await detect_inactive_subscriptions(req.subscriptions)
    return {"inactive_subscriptions": inactive}
