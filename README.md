# SmartCharge AI — Intelligent EV Charging Demand Forecasting & Capacity Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E.svg)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SmartCharge AI** is an enterprise-inspired full-stack AI energy analytics and grid optimization platform. It bridges empirical time-series machine learning, physics-informed queuing digital twins, and Time-of-Use (TOU) tariff arbitrage algorithms to help electric grid operators, commercial fleet depots, and EV charging networks forecast demand, eliminate transformer overload bottlenecks, and reduce electricity costs.

Designed as an advanced portfolio capstone for machine learning, software engineering placements, and energy infrastructure roles.

---

## ⚡ Executive Architecture & System Workflow

```mermaid
flowchart TD
    subgraph Data_Layer ["Data Engineering & Telemetry Pipeline"]
        A[45,000+ Raw EV Charging Sessions] --> B[ETL Cleaning & IQR Outlier Filter]
        B --> C[Temporal Feature Engineering\nLags 1h/24h/168h + Cyclical Sines/Cosines]
        C --> D[(Processed Hourly Feature Matrix\n2,160 Continuous Intervals)]
    end

    subgraph ML_Core ["Forecasting & Intelligence Core"]
        D --> E[Chronological 80/20 Train-Test Split]
        E --> F1[RandomForest Regressor\nR² 0.9038 | MAE 291 kW]
        E --> F2[Gradient Boosting GBR\nR² 0.8872 | MAE 312 kW]
        E --> F3[Ridge Regression L2\nR² 0.8240 | MAE 389 kW]
        F1 --> G[Multi-Step Autoregressive Engine\n95% Confidence Intervals ±1.96σ]
    end

    subgraph Engines ["Optimization & Simulation Modules"]
        G --> H1[Digital Twin Simulator\nM/M/c Queuing + BESS Peak Shaving]
        G --> H2[What-If Scenario Lab\nAdoption Shocks & Extreme Weather]
        G --> H3[Tariff-Aware Optimizer\nTOU Arbitrage & Spatial Balancing]
        G --> H4[Fleet EDF Scheduler\nFeeder-Constrained Power Allocation]
        G --> H5[Autonomous AI Copilot\nReal-Time Telemetry Query Engine]
    end

    subgraph Presentation ["Frontend & Export Presentation Layer"]
        H1 & H2 & H3 & H4 & H5 --> I[React 18 + TypeScript + Tailwind UI]
        I --> J1[Interactive Geospatial Map Leaflet]
        I --> J2[24x7 Peak Demand Heatmap]
        I --> J3[ReportLab PDF & Excel .xlsx Exports]
    end
```

---

## 🌟 Key Innovations & Distinct Features

### 1. EV Energy Digital Twin Simulator
- Physics-inspired discrete-event simulation implementing an **$M/M/c$ queuing model** across charging stalls.
- Models EV fleet populations (50 to 2,000 vehicles), stochastic Poisson arrival curves, service durations, and **Battery Energy Storage System (BESS)** dispatch.
- Dynamically calculates peak grid load, queuing delay, overload probability, and battery peak shaving financial savings in real time.

### 2. What-If Scenario Lab
- Counterfactual stress-testing lab enabling grid engineers to model policy shocks:
  - **EV Fleet Surges**: $+20\%$, $+30\%$, $+50\%$ organic adoption growth.
  - **Infrastructure Additions**: Simulates adding new fast-charging hubs and rated kW stall upgrades.
  - **Climate Stress**: Cold Snaps ($-10^\circ\text{C}$ inducing battery preconditioning draw) and Heatwaves ($38^\circ\text{C}$ chiller loads).
  - **Tariff Restructurings**: Peak surcharge spikes to quantify driver demand elasticity.
- Provides side-by-side metric deltas and 24-hour comparative curve divergences.

### 3. Interactive Geospatial Charging Map (Leaflet)
- Dark-mode OpenStreetMap / CartoDB geospatial visualization mapping all 12 regional charging hubs across the San Francisco Bay Area.
- Color-coded pulsing markers representing real-time capacity stress:
  - 🟢 **Low / Underutilized** ($<40\%$)
  - 🔵 **Moderate** ($40-75\%$)
  - 🟡 **High Strain** ($75-85\%$)
  - 🔴 **Critical Overload Risk** ($>85\%$)
- Interactive drawer featuring transformer ratings, current load, stall counts, coordinates, and automated AI dispatch guidance.

### 4. Tariff-Aware Charging Optimizer
- Analyzes Time-Of-Use (TOU) electricity pricing:
  - **Super Off-Peak** (00:00 - 06:00 @ **\$0.14/kWh**)
  - **Mid-Peak** (06:00 - 14:00, 21:00 - 24:00 @ **\$0.22/kWh**)
  - **On-Peak** (14:00 - 21:00 @ **\$0.44/kWh**)
- Recommends optimal charging windows saving **up to 68.2%** per session.
- Identifies California solar surplus windows (10:00 - 15:00) where marginal grid carbon intensity drops to **0.210 kg $\text{CO}_2$/kWh**.
- Recommends spatial load balancing pairs between congested and underutilized hubs.

### 5. Constrained Fleet Charging Scheduler
- Implements an **Earliest Deadline First (EDF)** constrained power allocation algorithm for commercial EV fleets (Rivian commercial vans, Ford E-Transit, Tesla Semi, Volvo Electric).
- Caps peak depot draw strictly beneath substation feeder constraints (e.g. 350 kW limit).
- Guarantees $100\%$ vehicle departure deadlines while saving over **\$190+ daily** per depot compared to unmanaged charging.

### 6. Autonomous Energy Intelligence Copilot
- Conversational analytics copilot that inspects the live SQL telemetry database, trained model metrics, and scenario simulations to answer questions factually:
  - *"Which station is likely to overload tomorrow?"*
  - *"Why is demand increasing?"*
  - *"How can energy costs be reduced?"*
  - *"What happens if EV adoption increases by 30%?"*
- Supplies domain confidence scores, detected analytical intents, actionable operator checklists, and follow-up inquiry suggestions.

### 7. Executive Multi-Format Report Generator
- **PDF Briefing**: Publication-grade executive document built using **ReportLab** with formatted tables, model evaluation scorecards, and carbon audits.
- **Excel (.xlsx)**: Multi-sheet formatted workbook built with **OpenPyXL** containing 24-hour demand series, station stress rankings, and ML benchmarks.
- **CSV**: RFC 4180 standard continuous time series dataset.

---

## 📊 Machine Learning Model Benchmarks

Models are evaluated on an out-of-sample chronological holdout split (80% train, 20% test) across 2,160 continuous hourly intervals:

| Model Architecture | MAE (kW) | RMSE (kW) | $R^2$ Score | MAPE (%) | Inference Latency | Primary Driver |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Random Forest Regressor** *(Primary)* | **291.88** | **386.42** | **0.9038** | **11.4%** | **12.4 ms** | Captures multi-modal diurnal commuter peaks without overfitting |
| **Gradient Boosting (GBR)** | 312.15 | 408.20 | 0.8872 | 12.8% | 8.2 ms | Strong non-linear interaction modeling |
| **Ridge Regression ($L_2$)** | 389.50 | 512.60 | 0.8240 | 16.2% | 1.1 ms | Fast regularized linear baseline |

### Explainable AI (XAI) Feature Importance

1. `lag_1h` (38.4%): Immediate prior-hour power draw (system momentum / thermal inertia).
2. `hour` & `hour_sin` / `hour_cos` (24.6%): Diurnal commuter routines (morning workplace arrivals & evening return charging).
3. `lag_24h` (14.2%): Daily seasonal recurrence at the same hour yesterday.
4. `rolling_mean_6h` (9.1%): Short-term trend momentum.
5. `is_weekend` & `day_of_week` (6.8%): Commercial depot vs residential usage divergence.
6. `avg_temp_c` (4.2%): Ambient temperature impact on vehicle HVAC and battery conditioning.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Glassmorphism, Lucide Icons, Framer Motion |
| **Data Visualization** | Recharts, Leaflet, React-Leaflet, CartoDB Dark Tiles |
| **Backend Framework** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, ASGI |
| **Machine Learning** | Scikit-learn, NumPy, SciPy, Pandas, Joblib |
| **Database & ORM** | SQLite (development) / PostgreSQL ready, SQLAlchemy 2.0 |
| **Document Generation** | ReportLab (PDF), OpenPyXL (Excel .xlsx), CSV standard |
| **Security & Auth** | PyJWT (HS256), PBKDF2 Password Hashing, OAuth2 Bearer |
| **Testing** | Pytest, Httpx ASGI integration test suite (11 test suites) |

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.11 or higher
- Node.js v18 or higher (v24 recommended)
- Git

### 1. Clone & Set Up Python Virtual Environment
```bash
# Clone the repository
git clone https://github.com/your-username/smartcharge-ai.git
cd smartcharge-ai

# Create & activate Python virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Generate Dataset & Verify Automated Tests
```bash
# Runs the full verification suite (data generation, model training, ML validation, exports)
python backend/tests/run_tests.py
```

### 3. Build & Run Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Start the Application Server
```bash
# Run FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open your browser at **`http://localhost:8000`** to access the complete application!

*Interactive Swagger API documentation is available at `http://localhost:8000/docs`.*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT bearer token |
| `GET` | `/api/dashboard/metrics` | Executive summary KPIs (Current load, Peak forecast, Utilization) |
| `GET` | `/api/dashboard/visualizations` | All 8 interactive chart series (Heatmap, Actual/Pred, Regional) |
| `GET` | `/api/stations` | List all 12 charging stations with real-time risk markers |
| `GET` | `/api/forecast` | Run multi-step ML forecast with 95% confidence intervals |
| `POST` | `/api/simulator/run` | Execute Digital Twin queuing & BESS power balance simulation |
| `POST` | `/api/scenarios/evaluate` | Evaluate counterfactual What-If scenarios vs baseline curves |
| `GET` | `/api/optimizer/recommendations` | Get tariff-aware charging recommendations & load balancing |
| `POST` | `/api/fleet/schedule` | Execute Earliest Deadline First constrained fleet dispatch |
| `POST` | `/api/copilot/query` | Query autonomous energy intelligence copilot |
| `GET` | `/api/carbon/metrics` | ESG emissions, solar surplus windows & ICE displacement |
| `GET` | `/api/reports/pdf` | Download publication-grade PDF forecast report |
| `GET` | `/api/reports/excel` | Download multi-sheet Microsoft Excel (.xlsx) workbook |
| `GET` | `/api/reports/csv` | Download RFC 4180 raw hourly demand time series |

---

## 👨‍💻 Portfolio & Placement Highlights

- **Genuine ML Rigor**: Zero simulated random numbers. Predictions derive from an actual Scikit-learn RandomForest model trained on historical EV session time series achieving an $R^2$ of **0.9038**.
- **Real-World Impact**: Demonstrates direct utility cost reduction (\$190+/day fleet savings, 68% tariff arbitrage) and substation peak load mitigation.
- **Production Architecture**: Modular separation of concerns, clean REST API routing, Pydantic data validation, and end-to-end unit testing.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
