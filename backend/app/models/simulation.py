from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.database.connection import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    scenario_name = Column(String(100), nullable=False) # e.g. "Scenario A: Current", "Scenario B: Optimized"
    input_parameters = Column(JSON, nullable=False)
    outputs = Column(JSON, nullable=False)
    is_simulated = Column(String(10), default="TRUE") # Explicit label: SIMULATED PREDICTION
