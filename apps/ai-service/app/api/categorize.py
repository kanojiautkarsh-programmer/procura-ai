from fastapi import APIRouter
from pydantic import BaseModel
from app.modules.categorization.service import categorize_invoice, detect_duplicate

router = APIRouter()


class CategorizeRequest(BaseModel):
    vendor_name: str
    description: str = ""
    amount: float = 0


class CategorizeBatchRequest(BaseModel):
    items: list[CategorizeRequest]


@router.post("/invoice")
async def categorize(req: CategorizeRequest):
    category = await categorize_invoice(req.vendor_name, req.description, req.amount)
    return {"vendor": req.vendor_name, "category": category}


@router.post("/batch")
async def categorize_batch(req: CategorizeBatchRequest):
    results = []
    for item in req.items:
        category = await categorize_invoice(item.vendor_name, item.description, item.amount)
        results.append({"vendor": item.vendor_name, "category": category})
    return {"results": results}


@router.post("/detect-duplicate")
async def duplicate_check(invoice_data: CategorizeRequest):
    is_dup, match_id = await detect_duplicate(invoice_data.model_dump())
    return {"is_duplicate": is_dup, "duplicate_of": match_id}
