from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.connection import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    model = Column(String(100), nullable=False)
    prediction_type = Column(String(50), nullable=False) # e.g. VISCOSITY_TREND, THERMAL_DECLINE, PUMP_EFFICIENCY, RISK
    value = Column(Float, nullable=False)
    model_version = Column(String(20), default="1.0.0")
