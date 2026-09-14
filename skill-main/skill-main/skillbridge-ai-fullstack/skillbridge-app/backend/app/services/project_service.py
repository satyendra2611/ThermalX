import os
import uuid

ALLOWED_EXTENSIONS = {".zip", ".pdf", ".docx"}
MAX_FILE_SIZE_MB = 25
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)


def validate_and_store(filename: str, content: bytes) -> dict:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {"valid": False, "error": "Unsupported file type. Please upload a ZIP, PDF, or DOCX."}
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        return {"valid": False, "error": f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB."}

    stored_name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, stored_name)
    with open(path, "wb") as f:
        f.write(content)

    return {"valid": True, "file_url": f"/uploads/{stored_name}"}
