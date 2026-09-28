from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.connection import Base

class SRPOperation(Base):
    __tablename__ = "srp_operations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    stroke_length_in = Column(Float, nullable=False)
    spm = Column(Float, nullable=False)
    vfd_speed_hz = Column(Float, nullable=False)
    rod_load_lbs = Column(Float, nullable=False)
    pump_efficiency_pct = Column(Float, nullable=False)
    peak_polished_rod_load_lbs = Column(Float, default=18500.0)
    min_polished_rod_load_lbs = Column(Float, default=7200.0)
    pump_fillage_pct = Column(Float, default=85.0)
    fluid_pound_risk = Column(Float, default=0.08)
    rod_floating_risk = Column(Float, default=0.12)
