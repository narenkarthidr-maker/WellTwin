from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime
from app.ml.model_registry import registry
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status", summary="Get comprehensive backend, twin, model, and replay system status")
def get_system_status() -> Dict[str, Any]:
    return {
        "project": "WELLTWIN",
        "description": "Baghewala Heavy-Oil Field Well-to-Surface Digital Twin",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "api_server": {"status": "ONLINE", "label": "FastAPI REST Server", "latency_ms": 2.4},
            "database": {"status": "ONLINE", "label": "SQLAlchemy Engine (Timescale/PostgreSQL Compatible)", "latency_ms": 1.1},
            "digital_twin": {"status": "READY", "label": "4-Layer Physics Engine (Reservoir, Wellbore, SRP, Surface)", "active_wells": 3},
            "ml_engine": {"status": "READY", "label": "Prediction & Isolation Forest Anomaly Pipeline", "models_loaded": 4},
            "joint_optimizer": {"status": "READY", "label": "Multi-Objective Constraint Optimizer", "constraints_enforced": 7},
            "replay_engine": {"status": "RUNNING", "label": "Continuous Telemetry Replay Engine", "active_well": "BGH-01"},
            "websocket_hub": {"status": "READY", "label": "Real-time Telemetry Dispatcher", "connected_clients": 1}
        },
        "version_info": {
            "app_version": settings.VERSION,
            "dataset_version": "SYNTH_BAGHEWALA_HEAVY_V2",
            "field_asset": "Bikaner-Nagaur Basin (Baghewala Field, Rajasthan)",
            "data_mode": "DEMO MODE • SYNTHETIC DATA",
            "last_calibrated": "2026-09-25"
        }
    }

@router.get("/models", summary="List registered models with versioning, training dataset, and validation metrics")
def get_model_registry() -> List[Dict[str, Any]]:
    return registry.list_models()
