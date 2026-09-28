import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import Base, engine
import app.models # Register all models with Base
from app.api.routes import (
    wells, digital_twin, css, srp,
    optimizer, simulator, health, recommendations,
    datasets, system
)
from app.services.replay_service import replay_service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "WELLTWIN: AI-Powered Well-to-Surface Digital Twin for CSS and SRP Optimization\n"
        "Baghewala Heavy-Oil Field (Decision-Support Platform Prototype)\n\n"
        "Decision-support prototype — operator approval required.\n"
        "All demo outputs use synthetic/replay data calibrated to Baghewala heavy oil reservoir physics."
    ),
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(wells.router, prefix=settings.API_PREFIX)
app.include_router(digital_twin.router, prefix=settings.API_PREFIX)
app.include_router(css.router, prefix=settings.API_PREFIX)
app.include_router(srp.router, prefix=settings.API_PREFIX)
app.include_router(optimizer.router, prefix=settings.API_PREFIX)
app.include_router(simulator.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_PREFIX)
app.include_router(datasets.router, prefix=settings.API_PREFIX)
app.include_router(system.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "WELLTWIN API",
        "field": settings.FIELD_NAME,
        "status": "ONLINE",
        "data_mode": "DEMO MODE • SYNTHETIC DATA",
        "docs_url": f"{settings.API_PREFIX}/docs"
    }

# WebSocket for real-time telemetry streaming / replay updates
@app.websocket("/ws/wells/{well_id}")
async def websocket_telemetry_stream(websocket: WebSocket, well_id: str):
    await websocket.accept()
    try:
        while True:
            # Advance replay simulation step if running
            replay_service.advance_step()
            state = replay_service.get_state()
            
            payload = {
                "well_id": well_id.upper(),
                "mode": "REPLAY",
                "label": "DEMO MODE • SYNTHETIC DATA",
                "telemetry": state["current_telemetry"],
                "step": state["current_step"],
                "total_steps": state["total_steps"],
                "is_playing": state["is_playing"]
            }
            await websocket.send_text(json.dumps(payload))
            # Sleep dynamically based on speed multiplier (nominal 2s per step)
            delay = max(0.2, 2.0 / replay_service.speed_multiplier)
            await asyncio.sleep(delay)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    is_production = settings.ENVIRONMENT.lower() == "production"
    app_target = app if is_production else "app.main:app"
    uvicorn.run(
        app_target,
        host="0.0.0.0",
        port=settings.PORT,
        reload=not is_production,
    )
