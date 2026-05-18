import logging
from typing import Optional
from app.core.llm import get_llm

logger = logging.getLogger(__name__)

# Known tool categories for overlap detection
TOOL_CATEGORIES = {
    "communication": {"slack", "teams", "discord", "zoom", "google meet", "microsoft teams"},
    "project_management": {"jira", "asana", "trello", "monday.com", "notion", "linear", "clickup", "basecamp"},
    "design": {"figma", "sketch", "adobe xd", "canva", "invision", "zeplin"},
    "analytics": {"google analytics", "mixpanel", "amplitude", "hotjar", "fullstory", "heap", "posthog"},
    "crm": {"salesforce", "hubspot", "pipedrive", "zoho crm", "freshsales", "close"},
    "marketing": {"mailchimp", "hubspot", "sendgrid", "constant contact", "activecampaign", "convertkit", "brevo"},
    "cloud_infra": {"aws", "gcp", "azure", "digitalocean", "heroku", "linode", "vercel", "netlify"},
    "hr": {"gusto", "bamboohr", "workday", "deel", "rippling", "remote", "justworks"},
    "code_hosting": {"github", "gitlab", "bitbucket"},
    "documents": {"google workspace", "microsoft 365", "notion", "confluence", "dropbox"},
    "customer_support": {"zendesk", "intercom", "freshdesk", "helpscout", "drift", "crisp"},
}

# Known low-usage indicators
INACTIVITY_KEYWORDS = [
    "unused", "never used", "no login", "inactive", "trial", "not adopted",
    "low usage", "replacement tool", "duplicate",
]


async def detect_inactive_subscriptions(subscriptions: list[dict]) -> list[dict]:
    """Identify subscriptions that might be inactive or underutilized."""
    inactive = []

    for sub in subscriptions:
        reasons = []

        # Check if last used date is old
        if sub.get("lastUsedDate") and sub.get("startDate"):
            from datetime import datetime, timezone
            try:
                last_used = datetime.fromisoformat(sub["lastUsedDate"].replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                days_since_use = (now - last_used).days
                if days_since_use > 90:
                    reasons.append(f"No activity in {days_since_use} days")
            except (ValueError, TypeError):
                pass

        # Check if allocated licenses are unused
        allocated = sub.get("allocatedLicenses", 0) or 0
        total_licenses = sub.get("licenseCount", 0) or 0
        if total_licenses > 0 and allocated < total_licenses * 0.3:
            reasons.append(f"Only {allocated}/{total_licenses} licenses allocated")

        # Check vendor notes for inactivity keywords
        notes = (sub.get("notes", "") or "").lower()
        for kw in INACTIVITY_KEYWORDS:
            if kw in notes:
                reasons.append(f"Note indicates: {kw}")
                break

        if reasons:
            inactive.append({
                "id": sub.get("id"),
                "name": sub.get("name"),
                "amount": sub.get("amount", 0),
                "reasons": reasons,
                "estimated_savings": round(sub.get("amount", 0) * 0.8, 2),
            })

    return inactive


def detect_overlapping_tools(subscriptions: list[dict]) -> list[dict]:
    """Find subscriptions that serve the same purpose."""
    # Group subscriptions by category
    categorized: dict[str, list[dict]] = {}

    for sub in subscriptions:
        name = (sub.get("name", "") or "").lower().strip()
        matched_cat = None
        for cat, tools in TOOL_CATEGORIES.items():
            for tool in tools:
                if tool in name or name in tool:
                    matched_cat = cat
                    break
            if matched_cat:
                break
        if matched_cat:
            categorized.setdefault(matched_cat, []).append(sub)

    overlaps = []
    for cat, tools in categorized.items():
        if len(tools) > 1:
            total_cost = sum(t.get("amount", 0) for t in tools)
            overlaps.append({
                "category": cat,
                "tools": [{"id": t.get("id"), "name": t.get("name"), "amount": t.get("amount", 0)} for t in tools],
                "count": len(tools),
                "total_cost": total_cost,
                "potential_savings": round(total_cost * 0.3, 2),
                "recommendation": f"Consider consolidating {cat} tools. "
                                  f"You have {len(tools)} overlapping subscriptions."
                                  f"Potential savings: ${total_cost * 0.3:.0f}/mo",
            })

    return overlaps


async def generate_optimization_recommendations(
    inactive: list[dict],
    overlaps: list[dict],
    subscriptions: list[dict],
) -> list[dict]:
    """Generate AI-powered spend optimization recommendations."""
    recommendations = []

    for item in inactive:
        llm = get_llm()
        prompt = f"""You are a spend optimization AI. Generate a brief recommendation for this subscription.

Subscription: {item['name']}
Monthly Cost: ${item['amount']}
Issues: {', '.join(item['reasons'])}

Provide a 1-2 sentence recommendation. Be specific and actionable."""

        response = await llm.ainvoke(prompt)
        recommendations.append({
            "type": "cancel_inactive",
            "subscription": item["name"],
            "reason": "; ".join(item["reasons"]),
            "estimated_savings": item["estimated_savings"],
            "action": response.content,
        })

    for overlap in overlaps:
        recommendations.append({
            "type": "consolidate_overlap",
            "category": overlap["category"],
            "tools": [t["name"] for t in overlap["tools"]],
            "reason": f"{overlap['count']} overlapping {overlap['category']} tools",
            "estimated_savings": overlap["potential_savings"],
            "action": overlap["recommendation"],
        })

    # General recommendations for any large subscriptions
    for sub in subscriptions:
        amount = sub.get("amount", 0)
        if amount > 5000:
            llm = get_llm()
            prompt = f"""Generate a brief negotiation/renewal recommendation for:

Subscription: {sub['name']}
Monthly Cost: ${amount}
Billing Period: {sub.get('billingPeriod', 'monthly')}

Provide a 1-2 sentence negotiation tip."""
            response = await llm.ainvoke(prompt)
            recommendations.append({
                "type": "negotiation_tip",
                "subscription": sub["name"],
                "estimated_savings": round(amount * 0.15, 2),
                "action": response.content,
            })

    return recommendations
