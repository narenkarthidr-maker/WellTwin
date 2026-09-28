from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database.connection import Base

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Thermal & Reservoir
    temperature_c = Column(Float, nullable=False)      # Reservoir / sandface temp in C
    pressure_bar = Column(Float, nullable=False)       # Bottomhole pressure in Bar
    viscosity_cp = Column(Float, nullable=False)       # Estimated downhole oil viscosity in cP
    
    # CSS Parameters
    steam_volume_tons = Column(Float, default=0.0)
    injection_pressure_bar = Column(Float, default=0.0)
    soak_time_days = Column(Float, default=0.0)
    
    # Surface & Production
    oil_rate_bpd = Column(Float, nullable=False)       # Oil rate barrels/day (or m3/d)
    water_rate_bpd = Column(Float, default=0.0)
    sor = Column(Float, default=3.2)                   # Steam-Oil Ratio (ton steam / ton oil or bbl/bbl)
    energy_kwh_per_bbl = Column(Float, default=42.5)   # Energy consumed per barrel
    
    # SRP Operating Parameters
    stroke_length_in = Column(Float, default=120.0)
    spm = Column(Float, default=5.2)                   # Strokes per minute
    vfd_speed_hz = Column(Float, default=45.0)
    rod_load_lbs = Column(Float, default=16500.0)
    pump_efficiency_pct = Column(Float, default=74.5)
    
    # Diagnostics & Risk Indicators
    rod_floating_risk = Column(Float, default=0.15)    # 0.0 - 1.0 scale
    impact_load_risk = Column(Float, default=0.10)     # 0.0 - 1.0 scale
    pump_unsetting_risk = Column(Float, default=0.05)  # 0.0 - 1.0 scale
    
    is_synthetic = Column(Boolean, default=True)       # ALWAYS flag synthetic/demo data
