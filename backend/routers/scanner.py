from fastapi import APIRouter, UploadFile, File, HTTPException

from ml.ocr import scan_receipt

router = APIRouter(prefix="/api/scanner", tags=["scanner"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


@router.post("/ocr")
async def ocr_receipt(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a JPG, PNG, or WEBP image.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")

    result = scan_receipt(contents, filename=file.filename or "receipt.jpg")
    return result
