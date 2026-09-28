from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.connection import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. BGH-01
    name = Column(String(100), nullable=False)
    field = Column(String(100), default="Baghewala Heavy Oil Field")
    status = Column(String(50), default="PRODUCING") # PRODUCING, INJECTING, SOAKING, SHUT_IN
    latitude = Column(Float, default=27.915)
    longitude = Column(Float, default=72.845)
    depth_m = Column(Float, default=1150.0) # Depth to Jodhpur sandstone formation
    reservoir_layer = Column(String(100), default="Jodhpur Sandstone (Heavy Oil)")
    current_css_cycle = Column(Integer, default=3)
    data_mode = Column(String(50), default="DEMO") # DEMO, REPLAY, FIELD
    created_at = Column(DateTime, default=datetime.utcnow)
