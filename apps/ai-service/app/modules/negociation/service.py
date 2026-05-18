import logging
from typing import Any

logger = logging.getLogger(__name__)

INDUSTRY_BENCHMARKS: dict[str, dict[str, float]] = {
    "saas": {
        "avg_discount_25p": 5.0,
        "avg_discount_50p": 10.0,
        "avg_discount_75p": 18.0,
        "avg_discount_90p": 25.0,
        "avg_annual_escalation": 7.0,
        "typical_contract_term_months": 12,
    },
    "cloud_infrastructure": {
        "avg_discount_25p": 8.0,
        "avg_discount_50p": 15.0,
        "avg_discount_75p": 25.0,
        "avg_discount_90p": 35.0,
        "avg_annual_escalation": 5.0,
        "typical_contract_term_months": 12,
    },
    "marketing": {
        "avg_discount_25p": 3.0,
        "avg_discount_50p": 8.0,
        "avg_discount_75p": 15.0,
        "avg_discount_90p": 20.0,
        "avg_annual_escalation": 10.0,
        "typical_contract_term_months": 12,
    },
    "hr_tools": {
        "avg_discount_25p": 5.0,
        "avg_discount_50p": 10.0,
        "avg_discount_75p": 15.0,
        "avg_discount_90p": 22.0,
        "avg_annual_escalation": 6.0,
        "typical_contract_term_months": 12,
    },
    "professional_services": {
        "avg_discount_25p": 2.0,
        "avg_discount_50p": 5.0,
        "avg_discount_75p": 10.0,
        "avg_discount_90p": 15.0,
        "avg_annual_escalation": 5.0,
        "typical_contract_term_months": 6,
    },
    "telecom": {
        "avg_discount_25p": 10.0,
        "avg_discount_50p": 20.0,
        "avg_discount_75p": 30.0,
        "avg_discount_90p": 40.0,
        "avg_annual_escalation": 3.0,
        "typical_contract_term_months": 24,
    },
}

DEFAULT_BENCHMARK = INDUSTRY_BENCHMARKS["saas"]


def _get_benchmark(category: str | None) -> dict[str, float]:
    if not category:
        return DEFAULT_BENCHMARK
    cat_lower = category.lower().strip()
    for key in INDUSTRY_BENCHMARKS:
        if key in cat_lower or cat_lower in key:
            return INDUSTRY_BENCHMARKS[key]
    return DEFAULT_BENCHMARK


def generate_negotiation_suggestions(vendor_data: dict[str, Any]) -> dict[str, Any]:
    vendor_name = vendor_data.get("vendorName", vendor_data.get("vendor_name", "Unknown Vendor"))
    category = vendor_data.get("category")
    current_spend = vendor_data.get("currentSpend", vendor_data.get("current_spend", 0))
    annual_spend = vendor_data.get("annualSpend", vendor_data.get("annual_spend", current_spend))
    contract_value = vendor_data.get("contractValue", vendor_data.get("contract_value", annual_spend))
    current_discount = vendor_data.get("currentDiscount", vendor_data.get("current_discount", 0))
    contract_term_months = vendor_data.get("contractTermMonths", vendor_data.get("contract_term_months", 12))
    seats = vendor_data.get("seats", vendor_data.get("numSeats", vendor_data.get("num_seats", 0)))
    renewal_date = vendor_data.get("renewalDate", vendor_data.get("renewal_date"))
    competitor_pricing = vendor_data.get("competitorPricing", vendor_data.get("competitor_pricing"))
    usage_percentage = vendor_data.get("usagePercentage", vendor_data.get("usage_percentage", 100))
    overlapping_tools = vendor_data.get("overlappingTools", vendor_data.get("overlapping_tools", []))
    contract_end = vendor_data.get("contractEnd", vendor_data.get("contract_end"))

    benchmarks = _get_benchmark(category)
    target_discount_50p = benchmarks["avg_discount_50p"]
    target_discount_75p = benchmarks["avg_discount_75p"]
    target_discount_25p = benchmarks["avg_discount_25p"]

    suggestions: list[dict[str, Any]] = []

    if current_discount < target_discount_50p:
        gap = target_discount_50p - current_discount
        savings = round(contract_value * (gap / 100), 2)
        if current_discount < target_discount_25p:
            tier = "aggressive"
            target = target_discount_50p
            message = (
                f"Your current discount ({current_discount}%) is well below the "
                f"industry median ({target_discount_50p}%) for {category or 'this category'}. "
                f"Target {target}% to save ~${savings:,.0f}/yr."
            )
        else:
            tier = "moderate"
            target = target_discount_75p
            message = (
                f"Your current discount ({current_discount}%) is below the top-tier "
                f"benchmark ({target_discount_75p}%) for {category or 'this category'}. "
                f"Aiming for {target}% could save ~${savings:,.0f}/yr."
            )
        suggestions.append({
            "type": "discount_increase",
            "tier": tier,
            "currentValue": current_discount,
            "targetValue": target,
            "potentialSavings": savings,
            "message": message,
        })

    if contract_term_months >= 12:
        multi_year_savings = round(contract_value * 0.05 * (contract_term_months / 12), 2)
        suggestions.append({
            "type": "multi_year_commitment",
            "tier": "moderate",
            "currentValue": contract_term_months,
            "targetValue": contract_term_months + 12,
            "potentialSavings": multi_year_savings,
            "message": (
                f"Committing to a {contract_term_months + 12}-month term (vs current {contract_term_months}) "
                f"typically yields 5% additional savings (~${multi_year_savings:,.0f})."
            ),
        })

    if seats > 0 and usage_percentage is not None and usage_percentage < 80:
        unused_seats = int(seats * (1 - usage_percentage / 100))
        seat_savings = round((current_spend / seats) * unused_seats, 2) if seats > 0 and current_spend > 0 else 0
        suggestions.append({
            "type": "seat_consolidation",
            "tier": "aggressive",
            "currentValue": seats,
            "targetValue": seats - unused_seats,
            "potentialSavings": seat_savings,
            "message": (
                f"Only {usage_percentage}% of your {seats} seats are actively used. "
                f"Rightsizing to {seats - unused_seats} seats saves ~${seat_savings:,.0f}/yr."
            ),
        })

    if overlapping_tools and len(overlapping_tools) > 0:
        overlap_savings = sum(
            tool.get("annualCost", tool.get("annual_cost", 0)) for tool in overlapping_tools
        )
        suggestions.append({
            "type": "overlap_elimination",
            "tier": "aggressive",
            "currentValue": len(overlapping_tools) + 1,
            "targetValue": 1,
            "potentialSavings": overlap_savings,
            "message": (
                f"You have {len(overlapping_tools)} overlapping tools. "
                f"Consolidating could save ~${overlap_savings:,.0f}/yr."
            ),
        })

    if competitor_pricing:
        competitor_name = competitor_pricing.get("vendorName", competitor_pricing.get("vendor_name", "competitor"))
        competitor_price = competitor_pricing.get("price", competitor_pricing.get("annualCost", 0))
        if competitor_price > 0 and current_spend > 0 and competitor_price < current_spend:
            comp_savings = round(current_spend - competitor_price, 2)
            suggestions.append({
                "type": "competitor_leverage",
                "tier": "moderate",
                "currentValue": current_spend,
                "targetValue": competitor_price,
                "potentialSavings": comp_savings,
                "message": (
                    f"{competitor_name} offers comparable service at ${competitor_price:,.0f}/yr "
                    f"(${comp_savings:,.0f} less). Use this as leverage in renewal negotiation."
                ),
            })

    if renewal_date or contract_end:
        suggestions.append({
            "type": "timing_strategy",
            "tier": "info",
            "currentValue": None,
            "targetValue": None,
            "potentialSavings": 0,
            "message": (
                "Start negotiations 60-90 days before renewal for maximum leverage. "
                "Vendors are more flexible before budget lock-in periods."
            ),
        })

    if usage_percentage is not None and 80 <= usage_percentage < 95:
        suggestions.append({
            "type": "usage_tier_upgrade",
            "tier": "info",
            "currentValue": usage_percentage,
            "targetValue": None,
            "potentialSavings": 0,
            "message": (
                f"You're using {usage_percentage}% of your current plan. "
                "Ask about usage-based pricing or next-tier discounts before you hit caps."
            ),
        })

    if not suggestions:
        suggestions.append({
            "type": "competitive_check",
            "tier": "info",
            "currentValue": None,
            "targetValue": None,
            "potentialSavings": 0,
            "message": "Your current terms appear competitive. Request a market check to ensure pricing remains fair.",
        })

    total_potential_savings = round(sum(s.get("potentialSavings", 0) for s in suggestions), 2)

    summary_segments = []
    if total_potential_savings > 0:
        pct = round((total_potential_savings / contract_value) * 100, 1) if contract_value > 0 else 0
        summary_segments.append(
            f"Total potential savings: ~${total_potential_savings:,.0f} ({pct}% of contract value)"
        )
    summary_segments.append(f"{len(suggestions)} recommendation(s) identified")
    summary = ". ".join(summary_segments)

    return {
        "vendorName": vendor_name,
        "category": category,
        "contractValue": contract_value,
        "currentDiscount": current_discount,
        "industryBenchmarks": benchmarks,
        "suggestions": suggestions,
        "totalPotentialSavings": total_potential_savings,
        "summary": summary,
    }


async def batch_negotiation_suggestions(vendors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for vendor in vendors:
        try:
            result = generate_negotiation_suggestions(vendor)
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to generate suggestions for vendor: {e}")
            results.append({
                "vendorName": vendor.get("vendorName", vendor.get("vendor_name", "Unknown")),
                "error": str(e),
            })
    return results
