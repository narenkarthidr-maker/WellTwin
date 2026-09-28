from fastapi import APIRouter
from app.services.css_service import css_service
from app.schemas.optimization import (
    CSSPredictionRequest, CSSPredictionResponse,
    CSSOptimizeRequest, CSSOptimizeResponse
)

router = APIRouter(prefix="/css", tags=["CSS"])

@router.post("/predict", response_model=CSSPredictionResponse, summary="Predict CSS cycle thermal and recovery response")
def predict_css(req: CSSPredictionRequest):
    return css_service.predict(req)

@router.post("/optimize", response_model=CSSOptimizeResponse, summary="Optimize CSS operating region based on objective weighting")
def optimize_css(req: CSSOptimizeRequest):
    return css_service.optimize(req)
