import logging
from datetime import datetime, timedelta
from typing import Optional
from app.core.llm import get_llm

logger = logging.getLogger(__name__)


def _calculate_moving_average(values: list[float], window: int = 3) -> list[float]:
    """Simple moving average forecast."""
    if len(values) < window:
        return values

    forecasts = []
    for i in range(len(values), len(values) + 3):  # forecast 3 periods ahead
        recent = values[-window:]
        avg = sum(recent) / len(recent)
        forecasts.append(avg)
    return forecasts


def _calculate_trend(values: list[float]) -> float:
    """Calculate linear trend direction. Positive = increasing spend."""
    if len(values) < 2:
        return 0
    x = list(range(len(values)))
    n = len(values)
    sum_x = sum(x)
    sum_y = sum(values)
    sum_xy = sum(x[i] * values[i] for i in range(n))
    sum_xx = sum(xi * xi for xi in x)
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x) if (n * sum_xx - sum_x * sum_x) != 0 else 0
    return slope


async def forecast_spend(
    monthly_data: list[dict],
    months_ahead: int = 3,
    use_ai: bool = False,
) -> dict:
    """Forecast future spend based on historical monthly data."""
    if not monthly_data:
        return {"forecast": [], "trend": "insufficient_data", "confidence": 0}

    # Sort by date
    monthly_data.sort(key=lambda x: x.get("date", ""))

    values = [m.get("amount", 0) for m in monthly_data]
    dates = [m.get("date", "") for m in monthly_data]

    if use_ai and len(values) >= 3:
        llm = get_llm()
        prompt = f"""Given this monthly spend data (amount in USD per month):

{chr(10).join(f'{d}: ${a:.2f}' for d, a in zip(dates, values))}

Forecast the next {months_ahead} months. Return ONLY a JSON array of forecasted amounts.
Consider seasonality, trends, and recent patterns.
Format: [amount1, amount2, amount3]"""

        response = await llm.ainvoke(prompt)
        try:
            import json
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[-1].rsplit("```", 1)[0]
            forecasts = json.loads(content)
        except Exception:
            forecasts = _calculate_moving_average(values)
    else:
        forecasts = _calculate_moving_average(values)

    trend_slope = _calculate_trend(values)
    if trend_slope > 0:
        trend = "increasing"
    elif trend_slope < 0:
        trend = "decreasing"
    else:
        trend = "stable"

    # Generate forecast entries
    last_date = datetime.fromisoformat(dates[-1].replace("Z", "+00:00")) if dates[-1] else datetime.now()
    forecast_entries = []
    for i, amount in enumerate(forecasts):
        next_month = (last_date.month + i) % 12 or 12
        next_year = last_date.year + (last_date.month + i - 1) // 12
        try:
            forecast_date = datetime(next_year, next_month, 1)
        except ValueError:
            forecast_date = last_date + timedelta(days=30 * (i + 1))

        forecast_entries.append({
            "date": forecast_date.isoformat(),
            "amount": round(amount, 2),
            "is_forecast": True,
        })

    total_forecast = sum(f["amount"] for f in forecast_entries)
    avg_monthly = sum(values) / len(values) if values else 0
    confidence = min(85, max(40, 100 - (len(values) * 5)))  # More data = higher confidence

    return {
        "forecast": forecast_entries,
        "trend": trend,
        "trend_slope": round(trend_slope, 2),
        "average_monthly": round(avg_monthly, 2),
        "total_forecast": round(total_forecast, 2),
        "confidence": confidence,
    }


async def detect_budget_overruns(
    budgets: list[dict],
    actuals: list[dict],
) -> list[dict]:
    """Compare budgets against actual spend and flag overruns."""
    alerts = []
    budget_map = {b.get("department", ""): b.get("amount", 0) for b in budgets}

    for actual in actuals:
        dept = actual.get("department", "")
        budgeted = budget_map.get(dept, 0)
        spent = actual.get("amount", 0)

        if budgeted > 0 and spent > budgeted:
            overrun_pct = round(((spent - budgeted) / budgeted) * 100, 1)
            alerts.append({
                "department": dept,
                "budgeted": budgeted,
                "spent": spent,
                "overrun_amount": round(spent - budgeted, 2),
                "overrun_percentage": overrun_pct,
                "severity": "critical" if overrun_pct > 50 else "warning",
            })
        elif budgeted > 0 and spent > budgeted * 0.85:
            alerts.append({
                "department": dept,
                "budgeted": budgeted,
                "spent": spent,
                "overrun_amount": 0,
                "overrun_percentage": 0,
                "severity": "info",
                "message": f"{dept} has used {round((spent / budgeted) * 100, 1)}% of budget",
            })

    return alerts


async def run_scenario(
    current_spend: float,
    growth_rate: float,
    cost_cuts: list[dict],
    months: int = 12,
) -> dict:
    """Run a budget scenario simulation."""
    projections = []
    running_spend = current_spend

    for i in range(months):
        month = i + 1
        # Apply growth rate
        running_spend *= (1 + growth_rate / 100 / 12)

        # Apply cost cuts
        monthly_savings = sum(c.get("monthly_savings", 0) for c in cost_cuts if c.get("active", False))
        running_spend -= monthly_savings

        projections.append({
            "month": month,
            "date": (datetime.now() + timedelta(days=30 * month)).isoformat(),
            "projected_spend": round(running_spend, 2),
            "savings_applied": round(monthly_savings, 2),
        })

    total_projected = sum(p["projected_spend"] for p in projections)
    total_savings = sum(p["savings_applied"] for p in projections)

    return {
        "scenario": {
            "current_spend": current_spend,
            "growth_rate": growth_rate,
            "cost_cuts_count": len(cost_cuts),
            "months": months,
        },
        "projections": projections,
        "total_projected": round(total_projected, 2),
        "total_savings": round(total_savings, 2),
    }
