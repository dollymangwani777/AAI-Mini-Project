# CivicPulse AI (PS-10)
## Smart City Grievance & Civic Issue Resolution System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlalchemy.org)
[![APScheduler](https://img.shields.io/badge/APScheduler-60s%20Autonomous-FF6F00.svg)](https://apscheduler.readthedocs.io)

An end-to-end, production-ready municipal governance platform featuring an autonomous **Multi-Agent Ingestion Pipeline**, **100m Proximity Duplicate Clustering**, an **Autonomous Escalation Engine (APScheduler)**, and an interactive **Control Center Operations Dashboard**.

---

## 🏗️ Project Architecture & Directory Layout

```
aai-miniproject/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── understanding_agent.py   # Agent 1: LLM text & risk extraction
│   │   │   ├── location_agent.py        # Agent 2: Ward geofence & GPS binding
│   │   │   ├── clustering_agent.py      # Agent 3: 100m Haversine duplicate clustering
│   │   │   ├── severity_agent.py        # Agent 4: Dynamic 0-100 severity scoring
│   │   │   ├── routing_agent.py         # Agent 5: Municipal department dispatch
│   │   │   ├── sla_agent.py             # Agent 6: SLA target & deadline lock
│   │   │   └── pipeline.py              # Master multi-agent coordinator & traces
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── complaints.py            # POST /submit, GET /track/{ticket}
│   │   │   └── admin.py                 # GET /incidents, PATCH /status, analytics, heatmap
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── scheduler.py             # APScheduler 60s autonomous escalation engine
│   │   │   └── seeder.py                # 18 realistic civic issue database seeder
│   │   ├── config.py                    # Environment & provider settings
│   │   ├── database.py                  # SQLAlchemy engine & session factory
│   │   ├── models.py                    # Incident, IncidentLog, DuplicateReport tables
│   │   ├── schemas.py                   # Pydantic v2 schemas & validations
│   │   └── main.py                      # FastAPI lifespan, CORS, router mounting
│   ├── requirements.txt                 # Backend Python dependencies
│   └── .env.example                     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── citizen/
│   │   │   │   ├── ComplaintForm.tsx    # Citizen form with GPS & prompt chips
│   │   │   │   ├── SubmissionStepper.tsx# Live 6-agent visual execution stepper
│   │   │   │   └── TrackingModal.tsx    # Live SLA ticker, stepper, audit logs
│   │   │   ├── dashboard/
│   │   │   │   ├── KpiBar.tsx           # KPI metrics (Active, Breaches, Speed, Index)
│   │   │   │   ├── CityMap.tsx          # React-Leaflet map with color pins & heatmap
│   │   │   │   ├── IncidentTable.tsx    # Queue table with filters & live SLA ticker
│   │   │   │   ├── ResolutionModal.tsx  # Field inspector resolution trigger
│   │   │   │   └── GovernanceCharts.tsx # Recharts department speed & ward leaderboard
│   │   │   └── Navbar.tsx               # Header, live heartbeat, tab switcher
│   │   ├── services/
│   │   │   └── api.ts                   # Axios client with proxy routing
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   ├── App.tsx                      # Root component & state synchronization
│   │   ├── main.tsx                     # Entrypoint
│   │   └── index.css                    # Tailwind styles & Leaflet dark theme
│   ├── index.html                       # HTML5 template with Inter/Outfit typography
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── tailwind.config.js               # Tailwind CSS tokens & palettes
│   └── vite.config.ts                   # Vite proxy configuration (port 5173 -> 8000)
│
├── .gitignore                           # Git ignore rules
└── README.md                            # Complete documentation
```

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Agent Ingestion Pipeline (FastAPI Engine)
When a citizen submits a grievance via the portal or API, the request executes through 6 sequential autonomous agents:
1. **Agent 1: Complaint Understanding Agent (LLM + Structured Output):**
   - Extracts semantic `issue_type` (e.g., `open_manhole`, `pothole`, `garbage_overflow`, `water_leak`, `street_light_defect`, `fallen_tree`, `drainage_overflow`).
   - Identifies danger risks (`traffic_safety`, `pedestrian_hazard`, `electrical_hazard`, `public_health`, `vulnerable_population_impact`).
   - Assesses `urgency_hint` (`low`, `medium`, `high`) and synthesizes a concise formal incident title.
   - Powered by LangChain Structured Outputs (OpenAI, Groq, or Anthropic) with a resilient rule-based semantic parser fallback for offline or zero-key environments.
2. **Agent 2: Location Intelligence Agent:**
   - Normalizes informal location strings (e.g. *"Near Sector 14 market"*, *"Civil Lines Hospital Gate"*) into verified City Ward identifiers (`Ward-01` through `Ward-10`) with geospatial coordinates.
   - Automatically binds raw citizen GPS coordinates to municipal ward boundaries.
3. **Agent 3: Duplicate & Incident Clustering Node:**
   - Evaluates active (unresolved) complaints using the **Haversine formula** within a **100-meter radius**.
   - If an active match with the same semantic issue type exists: **does NOT create an isolated ticket**.
   - Appends the report to the parent ticket, increments `reported_by_count`, dynamically elevates the parent incident's severity, and writes an immutable audit record.
4. **Agent 4: Priority & Severity Agent:**
   - Calculates a dynamic `severity_score` (0–100) combining base issue hazard, detected risks, urgency, and citizen crowdsource count.
   - Maps to priority tiers: `LOW` (0-35), `MEDIUM` (36-60), `HIGH` (61-80), `CRITICAL` (81-100).
5. **Agent 5: Department Routing Agent:**
   - Deterministically dispatches tickets:
     - Garbage / Sanitation $\rightarrow$ **Municipal Sanitation Unit**
     - Potholes / Road damage / Open manholes $\rightarrow$ **Public Works Department (PWD)**
     - Water pipeline bursts / Sewage $\rightarrow$ **Water Supply & Sewerage Board**
     - Streetlights / Hanging live wires $\rightarrow$ **Power Utility Board**
     - Fallen trees / Parks $\rightarrow$ **Horticulture & Parks Wing**
6. **Agent 6: SLA & Deadline Assignment Agent:**
   - Assigns turnaround time based on severity:
     - `CRITICAL` $\rightarrow$ **6 Hours**
     - `HIGH` $\rightarrow$ **24 Hours**
     - `MEDIUM` $\rightarrow$ **48 Hours**
     - `LOW` $\rightarrow$ **72 Hours**
   - Locks `sla_deadline = created_at + timedelta(hours=sla)`.

---

### 2. Autonomous Escalation Engine (Background Service)
- Runs an **APScheduler** background daemon every 60 seconds (`check_sla_and_escalate`).
- Inspects all active, unresolved incidents:
  - **Level 1 Escalation:** If `now() > sla_deadline` and `escalation_level == 0`:
    - Updates status to `ESCALATED`, sets `escalation_level = 1`.
    - Automatically dispatches alert to **District Supervisor** and writes an audit log.
  - **Level 2 Escalation:** If overdue by **>12 additional hours** and `escalation_level == 1`:
    - Sets `escalation_level = 2` (Escalated to **City Commissioner**).
    - Logs high-severity emergency breach.

---

### 3. Frontend Control Center & Citizen Portal
- **View 1: Citizen Reporting Portal:**
  - Modern card design with auto-expanding textarea, example prompt chips, auto-detect GPS, and image dropzone.
  - **Live Multi-Agent Stepper:** Visually steps through all 6 agents during submission with instant feedback.
  - **Citizen Tracking Hub:** Real-time SLA countdown timer (hours, minutes, seconds), interactive progress stepper, and immutable audit timeline.
- **View 2: Smart City Operations Dashboard (Control Center):**
  - **Top KPI Bar:** Total Active Incidents, SLA Breaches, Average Turnaround Speed, City Efficiency Index (0–100).
  - **Interactive Leaflet Map:**
    - Custom color-coded pins: Green (Low), Yellow (Med), Orange (High), Red (Critical).
    - **Pulsing Red Markers:** Highlights escalated or SLA-breached emergencies.
    - **Toggleable Heatmap Density Layer:** Highlights municipal issue concentration hotspots.
  - **Incident Queue Table:** Filterable by department, ward, severity, status, and SLA risk (Breached, Escalated, At Risk).
  - **Field Inspection & Resolution Modal:** Field engineers mark tickets `RESOLVED`, upload completion notes, and record resolver identity.
  - **Recharts Governance Visualizations:**
    - Bar Chart: Department resolution speed vs. SLA baseline.
    - Area Chart: Weekly complaint volume vs. resolution rate.
    - Ward Efficiency Leaderboard: Ranks civic zones by service speed and zero-breach compliance.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, FastAPI (async), Pydantic v2, SQLAlchemy, SQLite, APScheduler, LangChain Core/Groq/OpenAI/Anthropic |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide-React, React-Leaflet, Leaflet, Recharts, Axios |
| **Map Layer** | Leaflet with CARTO Dark Tiles, Dynamic SVG DivIcons, Heatmap Density Buffers |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed
- **Git** installed

### 2. Backend Setup
```bash
# Navigate to project root
cd c:/Users/Dolly/Desktop/aai-miniproject

# Activate Python virtual environment
.\venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will automatically initialize SQLite tables, seed 18 realistic civic issues, and start the background escalation daemon.
- Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
In a new terminal:
```bash
cd c:/Users/Dolly/Desktop/aai-miniproject/frontend

# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```
Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/complaints/submit` | Ingests citizen grievance, runs 6-agent pipeline, clusters duplicates, returns ticket |
| `GET` | `/api/complaints/track/{ticket_number}` | Returns status, SLA countdown, assigned department, and audit logs |
| `GET` | `/api/admin/incidents` | Lists incidents; filterable by `department`, `ward_id`, `severity`, `status`, `sla_risk`, `search` |
| `PATCH` | `/api/admin/incidents/{id}/status` | Updates workflow status (`IN_PROGRESS`, `RESOLVED`, `ESCALATED`) and records notes |
| `GET` | `/api/admin/analytics/overview` | Computes KPIs, turnaround times, department speeds, and ward leaderboard |
| `GET` | `/api/admin/analytics/heatmap` | Returns weighted `[lat, lng, weight]` coordinates for active grievances |
| `POST` | `/api/admin/seed` | Reseeds database with mock records for demo and testing |

---

## 🧪 Testing Multi-Agent Ingestion & Duplicate Clustering

### Test 1: Submit a New Grievance
```bash
curl -X POST http://127.0.0.1:8000/api/complaints/submit \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Deep dangerous pothole on bus transit lane near Sector 14 market, motorcycles slipping",
    "location": "Near Sector 14 market"
  }'
```
*Result: Generates a new ticket (e.g. `CP-2026-XXXX`), assigns HIGH severity (72.0), routes to Public Works Department (PWD), locks 24-hour SLA.*

### Test 2: Submit a Duplicate Report within 100 Meters
```bash
curl -X POST http://127.0.0.1:8000/api/complaints/submit \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Another car damaged its tire on the large pothole near Sector 14 market",
    "location": "Near Sector 14 market"
  }'
```
*Result: Automatically detected within 100m! Merges into the existing ticket, increments `reported_by_count` to 2, bumps severity score, and records audit trail.*
