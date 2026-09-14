from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["projects"])

DEMO_CHALLENGE = {
    "id": "task-manager",
    "topicId": "javascript",
    "title": "Build a Task Management Application",
    "description": "Apply the JavaScript and DOM concepts from your roadmap in a real, working project.",
    "requirements": [
        "Add, complete, and delete tasks",
        "Persist tasks between page reloads",
        "Responsive layout for mobile and desktop",
    ],
    "skillsTested": ["DOM manipulation", "Event handling", "Local storage", "Responsive CSS"],
}


@router.get("/challenge")
def get_challenge(topic_id: str = "javascript"):
    return DEMO_CHALLENGE


@router.post("/submit")
async def submit_project(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    project_id: str = Form(...),
):
    content = await file.read()
    result = project_service.validate_and_store(file.filename, content)
    if not result["valid"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "id": f"submission-{user_id}-{project_id}",
        "userId": user_id,
        "projectId": project_id,
        "fileUrl": result["file_url"],
        "status": "submitted",
    }
