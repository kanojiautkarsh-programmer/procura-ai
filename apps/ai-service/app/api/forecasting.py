from fastapi import APIRouter
from pydantic import BaseModel
from app.modules.forecasting.service import (
    forecast_spend,
    detect_budget_overruns,
    run_scenario,
)

router = APIRouter()


class ForecastRequest(BaseModel):
    monthly_data: list[dict]
    months_ahead: int = 3
    use_ai: bool = False


class BudgetCheckRequest(BaseModel):
    budgets: list[dict]
    actuals: list[dict]


class ScenarioRequest(BaseModel):
    current_spend: float
    growth_rate: float = 0
    cost_cuts: list[dict] = []
    months: int = 12


@router.post("/forecast")
async def forecast(req: ForecastRequest):
    result = await forecast_spend(req.monthly_data, req.months_ahead, req.use_ai)
    return result


@router.post("/budget-check")
async def budget_check(req: BudgetCheckRequest):
    alerts = await detect_budget_overruns(req.budgets, req.actuals)
    return {"alerts": alerts}


@router.post("/scenario")
async def scenario(req: ScenarioRequest):
    result = await run_scenario(req.current_spend, req.growth_rate, req.cost_cuts, req.months)
    return result
