from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TelemetryBase(BaseModel):
    well_id: str
    temperature_c: float
    pressure_bar: float
    viscosity_cp: float
    steam_volume_tons: float = 0.0
    injection_pressure_bar: float = 0.0
    soak_time_days: float = 0.0
    oil_rate_bpd: float
    water_rate_bpd: float = 0.0
    sor: float = 3.2
    energy_kwh_per_bbl: float = 42.0
    stroke_length_in: float = 120.0
    spm: float = 5.0
    vfd_speed_hz: float = 45.0
    rod_load_lbs: float = 16500.0
    pump_efficiency_pct: float = 75.0
    rod_floating_risk: float = 0.15
    impact_load_risk: float = 0.10
    pump_unsetting_risk: float = 0.05
    is_synthetic: bool = True

class TelemetryCreate(TelemetryBase):
    timestamp: Optional[datetime] = None

class TelemetryResponse(TelemetryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
