import logging
from typing import Optional
from app.core.llm import get_llm

logger = logging.getLogger(__name__)


async def categorize_invoice(vendor_name: str, description: str = "", amount: float = 0) -> str:
    """Use LLM to categorize an expense based on vendor and description."""
    llm = get_llm()

    categories = [
        "software", "hardware", "professional_services", "marketing",
        "office_supplies", "travel", "utilities", "insurance", "other",
    ]

    prompt = f"""Categorize this expense into one of: {', '.join(categories)}

Vendor: {vendor_name}
Description: {description or 'N/A'}
Amount: ${amount:.2f}

Return ONLY the category name, no explanation:"""

    response = await llm.ainvoke(prompt)
    category = response.content.strip().lower()

    # Validate against known categories
    for cat in categories:
        if cat in category:
            return cat

    return "other"


async def detect_duplicate(invoice_data: dict) -> tuple[bool, Optional[str]]:
    """Detect potential duplicate invoices using vendor + amount + date matching."""
    # For now, this is a stub that will query the API database
    # In production, this would compare against recent invoices
    return False, None
