from pydantic import BaseModel
from typing import List, Optional, Dict

class HourlyForecastItem(BaseModel):
    timestamp: str
    hour: int
    day_name: str
    predicted_demand_kw: float
    actual_demand_kw: Optional[float] = None
    lower_bound_kw: float
    upper_bound_kw: float
    confidence_interval_percent: float = 95.0
    is_peak_hour: bool
    tariff_period: str  # Off-Peak, Mid-Peak, Peak
    tariff_rate: float
    carbon_intensity_kg_kwh: float

class ModelMetricsOut(BaseModel):
    model_name: str
    mae: float
    rmse: float
    r2_score: float
    mape: float
    samples_trained: int
    training_time_ms: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    impact_description: str

class StationForecastItem(BaseModel):
    station_id: str
    name: str
    region: str
    capacity_kw: float
    current_demand_kw: float
    forecasted_peak_kw: float
    predicted_utilization: float
    risk_level: str
    recommended_action: str

class ForecastRequest(BaseModel):
    horizon_hours: int = 24  # 24, 48, 168 (7 days)
    model_type: str = "RandomForest"  # "RandomForest", "GradientBoosting", "LinearRegression"
    station_id: Optional[str] = None  # None for network aggregate

class ForecastResponse(BaseModel):
    horizon_hours: int
    model_used: str
    generated_at: str
    metrics: ModelMetricsOut
    all_models_metrics: List[ModelMetricsOut]
    hourly_forecast: List[HourlyForecastItem]
    peak_demand_window: str
    peak_demand_kw: float
    total_energy_forecast_kwh: float
    carbon_forecast_kg: float
    feature_importance: List[FeatureImportanceItem]
    station_forecasts: List[StationForecastItem]
