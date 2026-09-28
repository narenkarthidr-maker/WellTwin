from fastapi import APIRouter
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.simulator_service import simulator_service

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])

class ScenarioRunRequest(BaseModel):
    scenario_name: str = "Scenario: Custom Steaming"
    steam_volume_tons: float = 2600.0
    injection_pressure_bar: float = 112.0
    soak_time_days: float = 5.0
    stroke_length_in: float = 120.0
    spm: float = 5.2
    vfd_speed_hz: float = 45.0
    simulation_days: int = 90

@router.post("/run", summary="Run dynamic What-If simulation for specific operational inputs")
def run_simulation(req: ScenarioRunRequest):
    return simulator_service.simulate_scenario(
        scenario_name=req.scenario_name,
        steam_volume_tons=req.steam_volume_tons,
        injection_pressure_bar=req.injection_pressure_bar,
        soak_time_days=req.soak_time_days,
        stroke_length_in=req.stroke_length_in,
        spm=req.spm,
        vfd_speed_hz=req.vfd_speed_hz,
        simulation_days=req.simulation_days
    )

@router.get("/comparison", summary="Compare Scenario A (Current) vs Scenario B (Optimized) vs Scenario C (Custom)")
def get_scenario_comparison():
    return simulator_service.run_default_comparison()
