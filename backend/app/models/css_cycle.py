from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.connection import Base

class CSSCycle(Base):
    __tablename__ = "css_cycles"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    cycle_number = Column(Integer, nullable=False)
    steam_volume_tons = Column(Float, nullable=False)
    injection_pressure_bar = Column(Float, nullable=False)
    injection_rate_tons_per_day = Column(Float, default=120.0)
    soak_time_days = Column(Float, nullable=False)
    production_cutoff_bpd = Column(Float, default=15.0)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    cumulative_oil_tons = Column(Float, default=0.0)
    cumulative_steam_tons = Column(Float, default=0.0)
    final_sor = Column(Float, default=3.2)
