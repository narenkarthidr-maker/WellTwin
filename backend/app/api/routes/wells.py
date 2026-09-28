from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.dataset_service import dataset_service
from app.services.health_service import health_service
from app.services.recommendation_service import recommendation_service
from app.schemas.well import WellResponse, WellStateResponse

router = APIRouter(prefix="/wells", tags=["Wells"])

WELLS_METADATA = [
    {
        "id": 1,
        "well_id": "BGH-01",
        "name": "Baghewala Well #01",
        "field": "Baghewala Heavy Oil Field, Bikaner-Nagaur Basin",
        "status": "PRODUCING",
        "latitude": 27.915,
        "longitude": 72.845,
        "depth_m": 1150.0,
        "reservoir_layer": "Jodhpur Sandstone (Heavy Oil)",
        "current_css_cycle": 3,
        "data_mode": "DEMO",
        "created_at": "2024-01-10T08:00:00Z"
    },
    {
        "id": 2,
        "well_id": "BGH-02",
        "name": "Baghewala Well #02",
        "field": "Baghewala Heavy Oil Field, Bikaner-Nagaur Basin",
        "status": "PRODUCING",
        "latitude": 27.922,
        "longitude": 72.851,
        "depth_m": 1162.0,
        "reservoir_layer": "Jodhpur Sandstone (Heavy Oil)",
        "current_css_cycle": 4,
        "data_mode": "DEMO",
        "created_at": "2024-01-15T08:00:00Z"
    },
    {
        "id": 3,
        "well_id": "BGH-03",
        "name": "Baghewala Well #03",
        "field": "Baghewala Heavy Oil Field, Bikaner-Nagaur Basin",
        "status": "SHUT_IN",
        "latitude": 27.908,
        "longitude": 72.839,
        "depth_m": 1145.0,
        "reservoir_layer": "Jodhpur Sandstone (Heavy Oil)",
        "current_css_cycle": 4,
        "data_mode": "DEMO",
        "created_at": "2024-02-01T08:00:00Z"
    }
]

@router.get("", summary="List all monitored wells")
def list_wells() -> List[Dict[str, Any]]:
    return WELLS_METADATA

@router.get("/{well_id}", summary="Get well metadata by ID")
def get_well(well_id: str) -> Dict[str, Any]:
    for w in WELLS_METADATA:
        if w["well_id"].upper() == well_id.upper():
            return w
    raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

@router.get("/{well_id}/state", summary="Get current operational state & KPIs for Command Center")
def get_well_state(well_id: str) -> WellStateResponse:
    point = dataset_service.get_latest_point(well_id)
    well_info = next((w for w in WELLS_METADATA if w["well_id"].upper() == well_id.upper()), WELLS_METADATA[0])
    
    # Conditions
    t = point["temperature_c"]
    eff = point["pump_efficiency_pct"]
    flt = point["rod_floating_risk"]
    imp = point["impact_load_risk"]

    thermal_cond = "GOOD" if t > 110.0 else ("WATCH" if t > 75.0 else "WARNING")
    pump_cond = "GOOD" if eff > 70.0 else ("WATCH" if eff > 55.0 else "WARNING")
    rod_flt_cond = "GOOD" if flt < 0.20 else ("WATCH" if flt < 0.38 else "WARNING")
    imp_cond = "GOOD" if imp < 0.20 else ("WATCH" if imp < 0.40 else "WARNING")
    
    insight = (
        f"Reservoir cooling ({t:.1f}°C) is increasing estimated downhole viscosity to {int(point['viscosity_cp'])} cP. "
        "The predicted safe SRP operating window is narrowing. "
        "Run Joint Optimization before the next CSS cycle to prevent downstroke rod floating."
    )

    return WellStateResponse(
        well_id=well_id.upper(),
        name=well_info["name"],
        field=well_info["field"],
        data_mode="DEMO",
        data_mode_label="DEMO MODE • SYNTHETIC DATA",
        status=well_info["status"],
        timestamp=datetime.utcnow(),
        oil_rate_bpd=point["oil_rate_bpd"],
        water_rate_bpd=point["water_rate_bpd"],
        reservoir_temp_c=point["temperature_c"],
        estimated_viscosity_cp=point["viscosity_cp"],
        sor=point.get("sor", 3.2),
        pump_efficiency_pct=point["pump_efficiency_pct"],
        energy_kwh_per_bbl=point["energy_kwh_per_bbl"],
        stroke_length_in=point["stroke_length_in"],
        spm=point["spm"],
        vfd_speed_hz=point["vfd_speed_hz"],
        rod_load_lbs=point["rod_load_lbs"],
        steam_volume_tons=point.get("steam_volume_tons", 2600.0),
        injection_pressure_bar=point.get("injection_pressure_bar", 112.0),
        soak_time_days=point.get("soak_time_days", 5.0),
        thermal_condition=thermal_cond,
        pump_condition=pump_cond,
        rod_floating_risk=rod_flt_cond,
        impact_load_risk=imp_cond,
        pump_unsetting_risk="GOOD",
        production_trend="DECLINING" if t < 85.0 else "STABLE",
        ai_insight=insight,
        constraint_status="PASSED"
    )

@router.get("/{well_id}/telemetry", summary="Get historical telemetry stream")
def get_well_telemetry(well_id: str, limit: int = Query(50, ge=5, le=200)) -> List[Dict[str, Any]]:
    return dataset_service.get_telemetry_history(well_id.upper(), limit=limit)

@router.get("/{well_id}/health", summary="Get well health indicators")
def get_well_health(well_id: str) -> Dict[str, Any]:
    return health_service.get_well_health(well_id.upper())

@router.get("/{well_id}/recommendations", summary="Get recommendations for well")
def get_well_recommendations(well_id: str) -> List[Dict[str, Any]]:
    return recommendation_service.list_recommendations(well_id.upper())
