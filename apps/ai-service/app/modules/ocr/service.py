import io
import logging
from typing import Optional

from PIL import Image
import pytesseract
from pypdf import PdfReader
from pdf2image import convert_from_bytes

from app.core.llm import get_llm

logger = logging.getLogger(__name__)


async def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF using PyPDF, fallback to OCR for scanned docs."""
    reader = PdfReader(io.BytesIO(content))
    text_parts = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text and page_text.strip():
            text_parts.append(page_text)

    # If no text extracted (scanned PDF), fallback to OCR
    if not text_parts or all(len(t.strip()) < 20 for t in text_parts):
        logger.info("No extractable text found, falling back to OCR")
        images = convert_from_bytes(content, dpi=300)
        for img in images:
            text_parts.append(pytesseract.image_to_string(img))

    return "\n".join(text_parts)


async def extract_text_from_image(content: bytes) -> str:
    """Extract text from image using Tesseract OCR."""
    image = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(image)
    return text


async def parse_invoice_data(raw_text: str) -> dict:
    """Use LLM to parse structured invoice data from raw OCR text."""
    llm = get_llm()

    prompt = f"""Extract structured invoice data from the following OCR text.
Return a JSON object with these fields:
- vendor_name: the vendor/supplier name
- invoice_number: the invoice ID or number
- amount: the total amount (number only)
- tax_amount: tax amount if visible (number, default 0)
- currency: currency code (default USD)
- issue_date: invoice date (ISO format YYYY-MM-DD)
- due_date: payment due date (ISO format YYYY-MM-DD)
- category: best category from: software, hardware, services, marketing, office_supplies, travel, utilities, insurance, other
- description: brief description of what was purchased
- confidence: your confidence score 0-100 based on text clarity

OCR Text:
{raw_text[:3000]}

Return ONLY valid JSON, no explanation:"""

    response = await llm.ainvoke(prompt)
    content = response.content.strip()

    # Strip markdown code fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        content = content.rsplit("```", 1)[0]

    import json
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM response: {content}")
        return {
            "vendor_name": None,
            "invoice_number": None,
            "amount": 0,
            "tax_amount": 0,
            "currency": "USD",
            "issue_date": None,
            "due_date": None,
            "category": "other",
            "description": None,
            "confidence": 0,
        }
