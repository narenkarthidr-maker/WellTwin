from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from datetime import datetime
from app.database.connection import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(String(50), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    recommendation_type = Column(String(50), nullable=False) # JOINT_OPT, CSS_TIMING, SRP_ADJUSTMENT, THERMAL_ALERT, RISK_MITIGATION
    title = Column(String(200), nullable=False)
    what_action = Column(Text, nullable=False)
    why_explanation = Column(Text, nullable=False)
    expected_effect = Column(Text, nullable=False)
    confidence_pct = Column(Float, nullable=True) # Only when properly calibrated
    constraint_status = Column(String(20), default="PASSED") # PASSED, FAILED, WARNING
    constraint_details = Column(JSON, nullable=True)
    payload = Column(JSON, nullable=False) # Parameter values recommended
    approval_status = Column(String(30), default="PENDING_REVIEW") # PENDING_REVIEW, APPROVED_FOR_SIMULATION, REJECTED
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String(100), nullable=True)
