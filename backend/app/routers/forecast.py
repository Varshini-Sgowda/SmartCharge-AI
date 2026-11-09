from fastapi import APIRouter, Query
from typing import Optional
from ..schemas.forecast import ForecastResponse, ModelMetricsOut
from ..services.ml_engine import ml_engine

router = APIRouter(prefix="/forecast", tags=["Forecasting Engine"])

@router.get("", response_model=ForecastResponse)
def get_forecast(
    horizon_hours: int = Query(default=24, ge=12, le=168, description="Forecast horizon (hours)"),
    model_type: str = Query(default="RandomForest", description="Model architecture: RandomForest, GradientBoosting, RidgeRegression"),
    station_id: Optional[str] = Query(default=None, description="Optional station ID for localized forecasting")
):
    """
    Generates time series EV demand predictions using trained ML models,
    including 95% confidence intervals, feature importance weights, and station breakdowns.
    """
    result = ml_engine.predict_future(horizon_hours=horizon_hours, model_type=model_type, station_id=station_id)
    return result

@router.get("/metrics")
def get_model_evaluation_metrics():
    """
    Returns empirical evaluation metrics: MAE, RMSE, R2, MAPE across models.
    """
    if not ml_engine.is_trained:
        ml_engine.train_models()
    return {
        "models": list(ml_engine.metrics.values()),
        "primary_model": "RandomForest",
        "feature_importance": ml_engine.feature_importance,
        "evaluation_split": "80% Train, 20% Out-of-Sample Test (Chronological)",
        "confidence_methodology": "Empirical residual variance with square-root horizon expansion"
    }

@router.post("/retrain")
def retrain_models():
    """
    Triggers full pipeline retraining on the dataset.
    """
    metrics = ml_engine.train_models()
    return {
        "status": "success",
        "message": "Forecasting models successfully retrained and cached.",
        "metrics": metrics
    }
