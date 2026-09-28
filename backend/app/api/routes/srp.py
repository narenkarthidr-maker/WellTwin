from fastapi import APIRouter
from app.services.srp_service import srp_service
from app.schemas.optimization import (
    SRPPredictionRequest, SRPPredictionResponse,
    SRPOptimizeRequest, SRPOptimizeResponse
)

router = APIRouter(prefix="/srp", tags=["SRP"])

@router.post("/predict", response_model=SRPPredictionResponse, summary="Predict SRP volumetric efficiency, loads, and rod floating risk")
def predict_srp(req: SRPPredictionRequest):
    return srp_service.predict(req)

@router.post("/optimize", response_model=SRPOptimizeResponse, summary="Calculate safe SPM operating window and mechanical risk tradeoff")
def optimize_srp(req: SRPOptimizeRequest):
    return srp_service.optimize(req)
