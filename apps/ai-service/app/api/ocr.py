from fastapi import APIRouter, UploadFile, File, HTTPException
from app.modules.ocr.service import extract_text_from_pdf, extract_text_from_image, parse_invoice_data

router = APIRouter()


@router.post("/extract")
async def extract_ocr(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    content = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            raw_text = await extract_text_from_pdf(content)
        elif any(filename.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]):
            raw_text = await extract_text_from_image(content)
        else:
            raise HTTPException(400, f"Unsupported file type: {filename}")
    except Exception as e:
        raise HTTPException(500, f"OCR extraction failed: {str(e)}")

    # Use LLM to parse structured data from raw OCR text
    parsed = await parse_invoice_data(raw_text)

    return {
        "raw_text": raw_text[:2000],
        "parsed": parsed,
        "confidence": parsed.get("confidence", 0),
    }


@router.post("/extract-batch")
async def extract_ocr_batch(files: list[UploadFile] = File(...)):
    results = []
    for file in files:
        content = await file.read()
        filename = file.filename.lower()
        try:
            if filename.endswith(".pdf"):
                raw_text = await extract_text_from_pdf(content)
            else:
                raw_text = await extract_text_from_image(content)
            parsed = await parse_invoice_data(raw_text)
            results.append({
                "filename": file.filename,
                "status": "success",
                "parsed": parsed,
                "confidence": parsed.get("confidence", 0),
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e),
            })
    return {"results": results}
