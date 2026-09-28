from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class WellBase(BaseModel):
    well_id: str
    name: str
    field: str = "Baghewala Heavy Oil Field"
    status: str = "PRODUCING"
    latitude: float = 27.915
    longitude: float = 72.845
    depth_m: float = 1150.0
    reservoir_layer: str = "Jodhpur Sandstone (Heavy Oil)"
    current_css_cycle: int = 3
    data_mode: str = "DEMO"

class WellResponse(WellBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class WellStateResponse(BaseModel):
    well_id: str
    name: str
    field: str
    data_mode: str = "DEMO"
    data_mode_label: str = "DEMO MODE • SYNTHETIC DATA"
    status: str
    timestamp: datetime
    
    # KPIs
    oil_rate_bpd: float
    water_rate_bpd: float
    reservoir_temp_c: float
    estimated_viscosity_cp: float
    sor: float
    pump_efficiency_pct: float
    energy_kwh_per_bbl: float
    
    # Operation state
    stroke_length_in: float
    spm: float
    vfd_speed_hz: float
    rod_load_lbs: float
    steam_volume_tons: float
    injection_pressure_bar: float
    soak_time_days: float
    
    # Risks (GOOD, WATCH, WARNING, CRITICAL)
    thermal_condition: str
    pump_condition: str
    rod_floating_risk: str
    impact_load_risk: str
    pump_unsetting_risk: str
    production_trend: str
    
    # AI Insight snippet
    ai_insight: str
    
    # Engineering validation snippet
    constraint_status: str
