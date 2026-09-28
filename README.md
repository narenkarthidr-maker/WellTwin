# WELLTWIN
### AI-Powered Well-to-Surface Digital Twin for CSS and SRP Optimization
**Baghewala Heavy-Oil Field, Bikaner-Nagaur Basin, Rajasthan**  
*Prototype System — Well-to-Surface Decision Support Platform*

---

> [!IMPORTANT]
> **Engineering Decision-Support System Notice:**  
> This application is an engineering decision-support prototype. It does **not** directly control real oilfield equipment.  
> All demo outputs and telemetry use **DEMO / SYNTHETIC / REPLAY DATA** physically calibrated to Baghewala reservoir conditions (Jodhpur Sandstone, 17.5° API heavy oil, ~8,500 cP dead oil viscosity).

---

## 🌟 The Core Engineering Innovation

> **“We do not optimize CSS and SRP independently.**  
> **We model how thermal reservoir behavior affects heavy-oil viscosity,**  
> **how viscosity affects artificial-lift performance,**  
> **and then jointly optimize CSS and SRP within engineering constraints.”**

```
REAL/DEMO WELL DATA
        ↓
DATA QUALITY & PROCESSING
        ↓
HYBRID DIGITAL TWIN (Reservoir → Wellbore → SRP → Surface)
        ↓
AI/ML PREDICTION (Arrhenius Inversion + Isolation Forest)
        ↓
JOINT CSS + SRP OPTIMIZATION
        ↓
ENGINEERING CONSTRAINT CHECK (7 Safety Gates)
        ↓
EXPLAINABLE RECOMMENDATION (High / Med / Low Factors)
        ↓
HUMAN-IN-THE-LOOP APPROVAL
        ↓
WHAT-IF SIMULATION / FIELD ACTION
        ↓
FEEDBACK LOOP ↺
```

---

## 🚀 Application Structure & Pages

| # | Page | Route | Description |
|---|---|---|---|
| **01** | **Command Center** | `/` | Answers in seconds: *“What is happening to this well?”* KPIs, health status, AI insights, and SCADA baseline vs model recommendation. |
| **02** | **Digital Twin** | `/digital-twin` | Centerpiece 4-layer well-to-surface interactive diagram (Surface, SRP, Wellbore, Reservoir) with **WebGL 3D Twin (Three.js)** and 2D engineering schematic toggles. |
| **03** | **CSS Optimizer** | `/css-optimizer` | Cyclic Steam Stimulation cycle optimization balancing thermal response, oil recovery, and steam consumption. |
| **04** | **SRP Optimizer** | `/srp-optimizer` | Sucker Rod Pump kinematic optimization with **SPM vs Volumetric Efficiency & Mechanical Risk** tradeoff curve. |
| **05** | **Joint Optimizer** | `/joint-optimizer` | The flagship coupled optimizer solving CSS + SRP simultaneously across 7 deterministic safety gates. |
| **06** | **What-If Simulator** | `/simulator` | Multi-scenario 90-day trajectory comparison (Scenario A: Baseline vs Scenario B: Joint Optimized vs Scenario C: Custom). |
| **07** | **Predictive Health** | `/predictive-health` | 5 health dimensions (Thermal, Pump, Rod, Production, Equipment) + 4 risk cards (Rod Floating, Fatigue, Unsetting, Fluid Pound). |
| **08** | **Recommendations** | `/recommendations` | Explainable engineering proposals with Human-in-the-Loop review, approve for simulation, and rejection workflows. |
| **09** | **Data & Replay** | `/data-replay` | Time-series playback transport (Play, Pause, Step, Speed), CSV/JSON upload, and data quality validation. |
| **10** | **System Status** | `/system-status` | Real-time backend, twin, model registry, dataset versions, and latency diagnostics. |
| **11** | **Methodology** | `/methodology` | Technical whitepaper guide detailing governing equations (Arrhenius viscosity law, API RP 11L SRP mechanics, Marx-Langenheim heat balance). |

---

## 🛠 Technology Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Three.js (3D Digital Twin).
- **Backend:** Python 3.14+, FastAPI, Pydantic V2, SQLAlchemy, Uvicorn, WebSockets.
- **AI & ML:** NumPy, Pandas, SciPy, Scikit-Learn (Isolation Forest unsupervised anomaly detection & feature engineering).
- **Physics Models:**
  - Reservoir: Andrade/Arrhenius temperature-dependent viscosity law ($8500 \text{ cP} \to 18 \text{ cP}$).
  - Wellbore: Depth-dependent enthalpy loss, vertical pressure gradient, sandface steam quality.
  - SRP Pump: Mills acceleration factor, buoyant rod string weight, viscous drag on downstroke, rod floating ratio, and pump fillage.
  - Constraints: 7 hard engineering safety boundaries (145 bar fracture cap, 320°C casing limit, API Grade D yield tension, etc.).

---

## 🚦 Quick Start Guide

### 1. Backend Server (FastAPI)
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Docs (Swagger UI): [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)
- WebSocket Endpoint: `ws://127.0.0.1:8000/ws/wells/{well_id}`

### 2. Frontend Application (Next.js)
```powershell
cd frontend
npm run dev
```
- Application Web UI: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Guided Demo Flow

Click the **"Guided Demo"** button in the top header or **"Start Guided Demo"** in the sidebar to walk through the 8-step interactive sequence:
1. **Problem Statement:** Heavy oil viscosity spike during thermal drawdown.
2. **Observe:** Digital Twin detects thermal decline from 145°C to 82°C.
3. **Predict:** AI projects near-wellbore mobility and downstroke rod floating hazard.
4. **Optimize:** Joint Optimizer evaluates coupled CSS steaming + SRP stroke & SPM.
5. **Validate:** Deterministic Constraint Engine audits 7 boundaries and rejects unsafe states.
6. **Recommend:** Explainable engineering recommendation generated.
7. **Simulate:** What-If simulator compares baseline vs optimized 90-day trajectories.
8. **Feedback Loop:** Telemetry streaming updates calibration parameters.
