import os
import time
from datetime import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

from .data_pipeline import PROCESSED_DATA_PATH, RAW_DATA_PATH, STATION_METADATA

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "models"))
FEATURE_COLS = [
    "hour", "day_of_week", "is_weekend", "month",
    "hour_sin", "hour_cos", "dow_sin", "dow_cos",
    "lag_1h", "lag_2h", "lag_24h", "lag_168h",
    "rolling_mean_6h", "rolling_std_24h", "avg_temp_c"
]
TARGET_COL = "total_demand_kw"

class MLEngine:
    def __init__(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        self.models: Dict[str, Any] = {}
        self.metrics: Dict[str, Dict[str, Any]] = {}
        self.feature_importance: List[Dict[str, Any]] = []
        self.is_trained: bool = False
        self.training_time_ms: float = 0.0
        self.residual_std: float = 25.0
        self._load_cached_models_if_available()

    def _load_cached_models_if_available(self) -> bool:
        rf_path = os.path.join(MODELS_DIR, "randomforest_model.pkl")
        gb_path = os.path.join(MODELS_DIR, "gradientboosting_model.pkl")
        ridge_path = os.path.join(MODELS_DIR, "ridgeregression_model.pkl")
        meta_path = os.path.join(MODELS_DIR, "models_metadata.pkl")

        if os.path.exists(rf_path) and os.path.exists(gb_path) and os.path.exists(ridge_path) and os.path.exists(meta_path):
            try:
                self.models["RandomForest"] = joblib.load(rf_path)
                self.models["GradientBoosting"] = joblib.load(gb_path)
                self.models["RidgeRegression"] = joblib.load(ridge_path)
                cached_meta = joblib.load(meta_path)
                self.metrics = cached_meta["metrics"]
                self.feature_importance = cached_meta["feature_importance"]
                self.residual_std = cached_meta.get("residual_std", 25.0)
                self.training_time_ms = cached_meta.get("training_time_ms", 120.0)
                self.is_trained = True
                return True
            except Exception:
                pass
        return False

    def train_models(self) -> Dict[str, Any]:
        """
        Loads processed hourly time series, performs a chronological 80/20 train/test split,
        trains RandomForest, GradientBoosting, and Ridge regression models,
        and computes MAE, RMSE, R2, and MAPE.
        """
        start_t = time.time()
        if not os.path.exists(PROCESSED_DATA_PATH):
            raise FileNotFoundError(f"Processed dataset not found at {PROCESSED_DATA_PATH}")

        df = pd.read_csv(PROCESSED_DATA_PATH)
        df["timestamp_hour"] = pd.to_datetime(df["timestamp_hour"])
        df = df.sort_values("timestamp_hour").reset_index(drop=True)

        # Chronological train/test split (80% train, 20% test)
        split_idx = int(len(df) * 0.8)
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]

        X_train = train_df[FEATURE_COLS]
        y_train = train_df[TARGET_COL]
        X_test = test_df[FEATURE_COLS]
        y_test = test_df[TARGET_COL]

        model_candidates = {
            "RandomForest": RandomForestRegressor(n_estimators=80, max_depth=10, random_state=42, n_jobs=1),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=60, learning_rate=0.08, max_depth=4, random_state=42),
            "RidgeRegression": Ridge(alpha=1.0)
        }

        all_metrics = {}

        for name, model in model_candidates.items():
            m_start = time.time()
            model.fit(X_train, y_train)
            train_duration = (time.time() - m_start) * 1000.0

            preds = model.predict(X_test)
            # Clip negative predictions
            preds = np.clip(preds, a_min=10.0, a_max=None)

            mae = mean_absolute_error(y_test, preds)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            r2 = r2_score(y_test, preds)
            # Safe MAPE calculation avoiding division by zero
            mape = np.mean(np.abs((y_test - preds) / np.maximum(y_test, 10.0))) * 100.0

            self.models[name] = model
            all_metrics[name] = {
                "model_name": name,
                "mae": round(float(mae), 2),
                "rmse": round(float(rmse), 2),
                "r2_score": round(float(r2), 4),
                "mape": round(float(mape), 2),
                "samples_trained": len(X_train),
                "training_time_ms": round(train_duration, 1)
            }

            # Save model to disk
            model_path = os.path.join(MODELS_DIR, f"{name.lower()}_model.pkl")
            joblib.dump(model, model_path)

        self.metrics = all_metrics
        self.is_trained = True
        self.training_time_ms = round((time.time() - start_t) * 1000.0, 1)

        # Residual std for confidence intervals from primary model (RandomForest)
        rf_preds = self.models["RandomForest"].predict(X_test)
        self.residual_std = float(np.std(y_test - rf_preds))

        # Compute feature importance from RandomForest
        rf = self.models["RandomForest"]
        importances = rf.feature_importances_
        indices = np.argsort(importances)[::-1]

        descriptions = {
            "lag_1h": "Immediate prior hour grid load (inertia)",
            "lag_24h": "Same hour yesterday demand pattern",
            "hour": "Diurnal time-of-day driver (morning commute/evening return)",
            "hour_sin": "Cyclical diurnal peak alignment",
            "hour_cos": "Cyclical diurnal trough alignment",
            "rolling_mean_6h": "Short-term trend momentum",
            "lag_168h": "Weekly seasonal recurrence (same day/hour last week)",
            "day_of_week": "Weekday vs Weekend behavioral split",
            "is_weekend": "Commercial vs residential activity shift",
            "avg_temp_c": "Ambient temperature HVAC & preconditioning draw",
            "rolling_std_24h": "Daily volatility envelope",
            "dow_sin": "Weekly cycle harmonic phase",
            "dow_cos": "Weekly cycle harmonic amplitude",
            "lag_2h": "Secondary short-term memory",
            "month": "Longer term seasonal variations"
        }

        self.feature_importance = [
            {
                "feature": FEATURE_COLS[i],
                "importance": round(float(importances[i]), 4),
                "impact_description": descriptions.get(FEATURE_COLS[i], "Predictive signal")
            }
            for i in indices
        ]

        # Save metadata to disk
        meta_path = os.path.join(MODELS_DIR, "models_metadata.pkl")
        joblib.dump({
            "metrics": all_metrics,
            "feature_importance": self.feature_importance,
            "residual_std": self.residual_std,
            "training_time_ms": self.training_time_ms
        }, meta_path)

        print(f"Models successfully trained. Primary model R2: {all_metrics['RandomForest']['r2_score']}, MAE: {all_metrics['RandomForest']['mae']} kW")
        return all_metrics

    def predict_future(self, horizon_hours: int = 24, model_type: str = "RandomForest", station_id: str = None) -> Dict[str, Any]:
        """
        Performs recursive auto-regressive multi-step time series forecasting.
        Generates predictions with 95% confidence bounds (1.96 * residual_std).
        """
        if not self.is_trained:
            self.train_models()

        if model_type not in self.models:
            model_type = "RandomForest"

        model = self.models[model_type]
        df = pd.read_csv(PROCESSED_DATA_PATH)
        df["timestamp_hour"] = pd.to_datetime(df["timestamp_hour"])
        last_row = df.iloc[-1].copy()
        last_timestamp = last_row["timestamp_hour"]

        # If station-level forecast requested, calculate station proportion
        station_share = 1.0
        st_meta = None
        if station_id:
            for s in STATION_METADATA:
                if s["station_id"] == station_id:
                    st_meta = s
                    break
            total_network_cap = sum(s["max_power_kw"] for s in STATION_METADATA)
            if st_meta:
                station_share = (st_meta["max_power_kw"] / total_network_cap) * st_meta["base_load_mult"]

        future_rows = []
        current_lags = list(df["total_demand_kw"].values[-168:])  # keep last 168 hours in memory
        recent_rolling = list(df["total_demand_kw"].values[-24:])
        current_temp = float(last_row["avg_temp_c"])

        for step in range(1, horizon_hours + 1):
            future_dt = last_timestamp + pd.Timedelta(hours=step)
            h = future_dt.hour
            dow = future_dt.dayofweek
            is_wknd = 1 if dow >= 5 else 0
            m = future_dt.month

            # Cyclical encodings
            h_sin = np.sin(2 * np.pi * h / 24.0)
            h_cos = np.cos(2 * np.pi * h / 24.0)
            dow_sin = np.sin(2 * np.pi * dow / 7.0)
            dow_cos = np.cos(2 * np.pi * dow / 7.0)

            lag_1 = current_lags[-1]
            lag_2 = current_lags[-2] if len(current_lags) >= 2 else lag_1
            lag_24 = current_lags[-24] if len(current_lags) >= 24 else lag_1
            lag_168 = current_lags[-168] if len(current_lags) >= 168 else lag_24

            rolling_6 = float(np.mean(current_lags[-6:]))
            rolling_std = float(np.std(recent_rolling[-24:])) if len(recent_rolling) >= 24 else 15.0

            # Diurnal temperature cycle proxy
            temp_proxy = current_temp + 4.0 * np.sin((h - 8) / 24.0 * 2 * np.pi)

            feat_vector = pd.DataFrame([{
                "hour": h,
                "day_of_week": dow,
                "is_weekend": is_wknd,
                "month": m,
                "hour_sin": h_sin,
                "hour_cos": h_cos,
                "dow_sin": dow_sin,
                "dow_cos": dow_cos,
                "lag_1h": lag_1,
                "lag_2h": lag_2,
                "lag_24h": lag_24,
                "lag_168h": lag_168,
                "rolling_mean_6h": rolling_6,
                "rolling_std_24h": rolling_std,
                "avg_temp_c": temp_proxy
            }])[FEATURE_COLS]

            pred_network_kw = float(model.predict(feat_vector)[0])
            pred_network_kw = max(25.0, pred_network_kw)

            # Update lag buffers for autoregression
            current_lags.append(pred_network_kw)
            recent_rolling.append(pred_network_kw)

            # Scale for specific station or network aggregate
            pred_kw = round(pred_network_kw * station_share, 1)

            # 95% Confidence interval calculation
            scale_factor = np.sqrt(step / 6.0)  # uncertainty compounds slightly over horizon
            std_adjusted = max(8.0, self.residual_std * station_share * scale_factor)
            lower_bound = max(0.0, round(pred_kw - 1.96 * std_adjusted, 1))
            upper_bound = round(pred_kw + 1.96 * std_adjusted, 1)

            # TOU Tariff & Carbon factor
            if 14 <= h < 21:
                tariff_period = "Peak"
                tariff_rate = 0.44
                carbon_intensity = 0.470
                is_peak = True
            elif 0 <= h < 6:
                tariff_period = "Off-Peak"
                tariff_rate = 0.14
                carbon_intensity = 0.320
                is_peak = False
            else:
                tariff_period = "Mid-Peak"
                tariff_rate = 0.22
                carbon_intensity = 0.210 if (10 <= h <= 15) else 0.380
                is_peak = False

            # Historical actual value if available in dataset (for validation view)
            actual_kw = None
            hist_match = df[df["timestamp_hour"] == future_dt]
            if not hist_match.empty:
                actual_kw = round(float(hist_match["total_demand_kw"].values[0]) * station_share, 1)

            future_rows.append({
                "timestamp": future_dt.strftime("%Y-%m-%d %H:%M"),
                "hour": h,
                "day_name": future_dt.strftime("%A"),
                "predicted_demand_kw": pred_kw,
                "actual_demand_kw": actual_kw,
                "lower_bound_kw": lower_bound,
                "upper_bound_kw": upper_bound,
                "confidence_interval_percent": 95.0,
                "is_peak_hour": is_peak,
                "tariff_period": tariff_period,
                "tariff_rate": tariff_rate,
                "carbon_intensity_kg_kwh": carbon_intensity
            })

        # Calculate station-wise breakdown
        station_forecasts = []
        total_net_cap = sum(s["max_power_kw"] for s in STATION_METADATA)
        peak_pred = max(r["predicted_demand_kw"] for r in future_rows)

        for s in STATION_METADATA:
            s_prop = (s["max_power_kw"] / total_net_cap) * s["base_load_mult"]
            st_peak_kw = round(peak_pred * s_prop, 1)
            util_rate = round((st_peak_kw / s["max_power_kw"]) * 100.0, 1)

            if util_rate > 90.0:
                risk = "Critical"
                action = "Trigger dynamic price throttle & reroute arrivals to adjacent hub"
            elif util_rate > 75.0:
                risk = "High"
                action = "Activate BESS peak shaving & send off-peak incentives"
            elif util_rate < 30.0:
                risk = "Low"
                action = "Promote discounted fleet charging to boost asset utilization"
            else:
                risk = "Moderate"
                action = "Nominal operation; monitor thermal thresholds"

            station_forecasts.append({
                "station_id": s["station_id"],
                "name": s["name"],
                "region": s["region"],
                "capacity_kw": s["max_power_kw"],
                "current_demand_kw": round(st_peak_kw * 0.65, 1),
                "forecasted_peak_kw": st_peak_kw,
                "predicted_utilization": util_rate,
                "risk_level": risk,
                "recommended_action": action
            })

        # Summary statistics
        peak_item = max(future_rows, key=lambda x: x["predicted_demand_kw"])
        peak_time_window = f"{peak_item['hour']:02d}:00 - {(peak_item['hour'] + 2) % 24:02d}:00"
        total_energy_kwh = round(sum(r["predicted_demand_kw"] for r in future_rows), 1)
        carbon_forecast_kg = round(sum(r["predicted_demand_kw"] * r["carbon_intensity_kg_kwh"] for r in future_rows), 1)

        return {
            "horizon_hours": horizon_hours,
            "model_used": model_type,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "metrics": self.metrics[model_type],
            "all_models_metrics": list(self.metrics.values()),
            "hourly_forecast": future_rows,
            "peak_demand_window": peak_time_window,
            "peak_demand_kw": peak_item["predicted_demand_kw"],
            "total_energy_forecast_kwh": total_energy_kwh,
            "carbon_forecast_kg": carbon_forecast_kg,
            "feature_importance": self.feature_importance,
            "station_forecasts": station_forecasts
        }

ml_engine = MLEngine()
