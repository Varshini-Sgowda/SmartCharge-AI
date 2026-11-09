import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "SmartCharge AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartcharge-super-secret-jwt-key-2026-ev-forecasting")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartcharge.db")
    
    # Real-world Grid Carbon Factor (kg CO2 / kWh)
    # Default US Grid average ~ 0.385 kg CO2/kWh; Clean window (solar/hydro) ~ 0.180, Peak coal/gas ~ 0.550
    BASE_CARBON_FACTOR_KG_PER_KWH: float = 0.385
    
    # Demo Time-Of-Use (TOU) Electricity Tariffs ($ / kWh)
    # Super Off-Peak: 00:00 - 06:00 ($0.12/kWh)
    # Off-Peak: 06:00 - 14:00, 21:00 - 24:00 ($0.19/kWh)
    # Peak (High Strain): 14:00 - 21:00 ($0.42/kWh)
    TARIFF_OFF_PEAK: float = 0.14
    TARIFF_MID_PEAK: float = 0.22
    TARIFF_PEAK: float = 0.44

settings = Settings()
