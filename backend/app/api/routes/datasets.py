from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.dataset_service import dataset_service
from app.services.replay_service import replay_service

router = APIRouter(prefix="/datasets", tags=["Datasets & Replay"])

class ReplayControlRequest(BaseModel):
    action: str # "PLAY" | "PAUSE" | "STEP_FORWARD" | "STEP_BACKWARD" | "RESET"
    speed: Optional[float] = None
    well_id: Optional[str] = None

@router.post("/upload", summary="Upload CSV or JSON telemetry dataset")
async def upload_dataset(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    res = dataset_service.validate_dataset(text, file.filename)
    return res

@router.post("/validate", summary="Validate dataset schema, missing values, duplicates, and outliers")
def validate_dataset_text(payload: Dict[str, Any]):
    raw_content = payload.get("content", "")
    filename = payload.get("filename", "upload.csv")
    return dataset_service.validate_dataset(raw_content, filename)

@router.post("/reset", summary="Reset demo synthetic dataset to factory baseline")
def reset_demo():
    return dataset_service.reset_demo_data()

@router.get("/replay", summary="Get current replay stream position and status")
def get_replay_status():
    return replay_service.get_state()

@router.post("/replay/control", summary="Control replay engine (PLAY, PAUSE, STEP_FORWARD, STEP_BACKWARD, RESET)")
def control_replay(req: ReplayControlRequest):
    return replay_service.set_control(
        action=req.action,
        speed=req.speed,
        well_id=req.well_id
    )
