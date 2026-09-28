# CoalGov AI: Smart Governance & Compliance Monitoring for Coal Mines

> **Smart India Hackathon 2026** | Problem Statement: **SIH26024** | **Ministry of Coal (Coal India Limited)** | Category: Software | Theme: Smart Automation

A centralized, AI-enabled platform that brings statutory compliance, inspections, contractor management, field reporting, and regulatory reporting for coal mines into one digital ecosystem with real-time dashboards, automated workflows, PWA offline reporting, and predictive risk alerts.

---

## 🌟 Key Capabilities & Hackathon Demo Highlights

1. **Compliance Registry**: Statutory obligations mapped under Mines Act 1952, DGMS Circulars, and CPCB norms.
2. **Offline-First PWA Field Inspector App**: HTML5 Camera capture, auto-geotagging GPS, IndexedDB local queue, and idempotent sync.
3. **Automated CAPA & SLA Escalation**: Auto-creates CAPAs on safety violations with SLA timers. Breached SLAs auto-escalate from Officer -> Mine Manager -> GM -> Corporate Director.
4. **AI/ML Engine**:
   - **Risk Scoring Engine (XGBoost)**: Evaluates risk index (0–100) per mine with contributing factors.
   - **Operational Anomaly Detection (Isolation Forest)**: Detects production/attendance/environmental spikes.
   - **Recurring Violation Clustering (NLP)**: Groups observation text into systemic issue clusters with root causes.
5. **GIS Risk Map**: Interactive Leaflet map showing mine boundary markers and risk heat levels across Coal India belts.
6. **One-Click Statutory PDF Reports**: Sub-second ReportLab PDF generation for mine compliance audits.
7. **Cryptographic SHA-256 Audit Ledger**: Parent-child hash chaining on all data mutations with a live verification UI and demonstration tamper detector.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm
- Docker Compose (optional for containerized deployment)

### 1-Command Setup & Local Run

```bash
# 1. Install Dependencies
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
cmd /c "cd web && npm install"

# 2. Seed Synthetic Demo Database
.\venv\Scripts\python backend\scripts\seed_demo.py

# 3. Start Backend Server (Port 8000)
.\venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

# 4. Start Web & PWA Mobile Dashboard (Port 3000)
cmd /c "cd web && npm run dev"
```

---

## 🔑 Demo Login Credentials

Pre-configured role accounts available for quick testing:

| Persona | Email | Password | Primary Interface |
|---|---|---|---|
| **Field Inspector** | `inspector@coalgov.in` | `inspector123` | Mobile PWA App (`/mobile`) |
| **Mine Manager** | `manager@coalgov.in` | `manager123` | Mine Dashboard (`/`) |
| **Corporate HQ** | `corporate@coalgov.in` | `corporate123` | Executive HQ View (`/corporate`) |
| **Regulator / DGMS** | `regulator@coalgov.in` | `regulator123` | Statutory Audit Portal (`/regulator`) |
| **System Admin** | `admin@coalgov.in` | `admin123` | Master Configuration |

---

## 🌐 URLs & Service Ports

| Component | URL | Description |
|---|---|---|
| **Web Dashboard** | `http://localhost:3000` | Full React + Tailwind Executive Dashboard |
| **Mobile PWA App** | `http://localhost:3000/mobile` | Mobile-first offline field inspector portal |
| **Backend API Docs** | `http://localhost:8000/docs` | OpenAPI / Swagger interactive documentation |
| **PDF Report Endpoint** | `http://localhost:8000/api/reports/compliance/pdf/<mine_id>` | Statutory PDF generator |

---

## 🏗️ Project Architecture

```
coalgov-ai/
├── backend/                  # FastAPI 0.110 REST API backend
│   ├── app/
│   │   ├── api/              # API routers (auth, mines, compliance, inspections, capas, ai, audit, ocr, reports)
│   │   ├── core/             # DB session, JWT security, settings
│   │   ├── models/           # SQLAlchemy 2 ORM schemas
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   ├── services/         # Audit hash chain, SLA escalation, AI scoring, PDF generator
│   │   └── main.py           # FastAPI entrypoint & APScheduler
│   ├── scripts/seed_demo.py  # Synthetic Coal India dataset seed script
│   └── tests/test_api.py     # Pytest test suite
├── web/                      # React 18 + TypeScript + Vite + Tailwind + Leaflet
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, LeafletMap, Footer
│   │   ├── context/          # AuthContext, SyncContext (PWA IndexedDB)
│   │   ├── pages/            # MineDashboard, Corporate, CapaBoard, FieldInspectorPWA, AuditLogViewer, OcrDigitizer
│   │   └── services/         # Axios API client, Dexie IndexedDB
│   └── public/               # PWA manifest.json & sw.js service worker
├── docs/                     # Walkthrough documentation & demo script
│   ├── DEMO_SCRIPT.md        # 5-minute judge walkthrough script
│   └── demo_users.md         # Demo credentials reference
├── infra/docker-compose.yml  # Docker Compose production configuration
├── Makefile                  # Developer shortcut commands
└── README.md
```

---

## 🧪 Running Automated Tests

```bash
# Run pytest backend test suite (Auth, Mines, Offline Sync Idempotency, SHA-256 Audit Ledger)
.\venv\Scripts\pytest backend\tests
```

---

## 📜 License & Hackathon Notice

Developed for **Smart India Hackathon 2026** (Problem Statement SIH26024 - Ministry of Coal / Coal India Limited).  
*Notice: All mine operational data used in this prototype is realistic synthetic data generated for evaluation purposes.*
