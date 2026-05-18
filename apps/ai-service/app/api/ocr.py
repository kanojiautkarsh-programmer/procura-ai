import magic
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.modules.ocr.service import extract_text_from_pdf, extract_text_from_image, parse_invoice_data
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/tiff",
    "image/bmp",
}

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".tif"}

MAX_FILE_SIZE = settings.max_upload_size_mb * 1024 * 1024

router = APIRouter()


async def validate_file(file: UploadFile) -> bytes:
    if not file.filename:
        raise HTTPException(400, "No file provided")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file extension: {ext}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"File too large. Max size: {settings.max_upload_size_mb}MB")

    if len(content) < 8:
        raise HTTPException(400, "File is empty or too small")

    try:
        mime = magic.from_buffer(content[:2048], mime=True)
        if mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(400, f"File content does not match allowed types (detected: {mime})")
    except Exception:
        pass  # magic not available on all platforms

    return content


@router.post("/extract")
async def extract_ocr(file: UploadFile = File(...)):
    content = await validate_file(file)
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            raw_text = await extract_text_from_pdf(content)
        else:
            raw_text = await extract_text_from_image(content)
    except Exception as e:
        raise HTTPException(500, "OCR extraction failed")

    parsed = await parse_invoice_data(raw_text)

    return {
        "raw_text": raw_text[:2000] if raw_text else "",
        "parsed": parsed,
        "confidence": parsed.get("confidence", 0),
    }


@router.post("/extract-batch")
async def extract_ocr_batch(files: list[UploadFile] = File(...)):
    if len(files) > 10:
        raise HTTPException(400, "Maximum 10 files per batch request")

    results = []
    for file in files:
        try:
            content = await validate_file(file)
            filename = file.filename.lower()
            raw_text = await (extract_text_from_pdf(content) if filename.endswith(".pdf") else extract_text_from_image(content))
            parsed = await parse_invoice_data(raw_text)
            results.append({
                "filename": file.filename,
                "status": "success",
                "parsed": parsed,
                "confidence": parsed.get("confidence", 0),
            })
        except HTTPException as e:
            results.append({"filename": file.filename, "status": "error", "error": e.detail})
        except Exception as e:
            results.append({"filename": file.filename, "status": "error", "error": str(e)})
    return {"results": results}
