import os
import shutil
import uuid

from fastapi import APIRouter, File, HTTPException, Request, UploadFile


router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "").rstrip("/")


@router.post("/image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG are accepted.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_extension = (file.filename or "").rsplit(".", 1)[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to save file: {exc}") from exc

    base_url = PUBLIC_API_URL or str(request.base_url).rstrip("/")
    return {"url": f"{base_url}/uploads/{unique_filename}"}
