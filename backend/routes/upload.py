import os
import uuid
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads"

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ. Chỉ chấp nhận JPG/PNG.")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {str(e)}")
    return {"url": f"http://127.0.0.1:8000/uploads/{unique_filename}"}
