import os
import uuid
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads"
# Đảm bảo thư mục tồn tại khi chạy local
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    # Kiểm tra định dạng
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận ảnh định dạng JPG/PNG")
    
    # Tạo tên file duy nhất tránh trùng lặp
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Lưu file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://127.0.0.1:8000/uploads/{filename}"}
