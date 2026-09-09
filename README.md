# SpendoraAI – Personal Expense Assistant

A full-stack, AI-powered personal finance app: automatic expense categorization,
spending analysis, forecasting, anomaly detection, budget suggestions, a
conversational assistant, and receipt OCR scanning.

- **Frontend:** React + Vite + Tailwind CSS, charts via Recharts, icons via lucide-react
- **Backend:** Python + FastAPI
- **Database:** MongoDB
- **AI/ML:** pandas, numpy, scikit-learn (categorization, linear-regression forecasting,
  z-score anomaly detection), pytesseract (receipt OCR)

The frontend works fully standalone with realistic demo data and local AI logic
(`frontend/src/lib/ai.js`) — no backend required to explore every page. When the
FastAPI backend + MongoDB are running, the frontend automatically calls the real
API for AI Assistant chat and receipt scanning, and falls back to local logic if
a request fails.

---

## Project Structure

```
spendoraai/
├── frontend/          React + Vite + Tailwind app
│   └── src/
│       ├── pages/          10 pages (Dashboard, Add Expense, Transactions, ...)
│       ├── components/     Sidebar, Topbar, Modal, StatCard, CategoryBadge, ...
│       ├── context/        ThemeContext (dark/light), DataContext (app state)
│       └── lib/            categories, demo data, AI helpers, formatting, API client
└── backend/           FastAPI + MongoDB app
    ├── main.py              App entry point
    ├── database.py          MongoDB (Motor) connection
    ├── models/schemas.py    Pydantic request/response models
    ├── routers/             transactions, incomes, budgets, goals, analytics,
    │                        assistant, scanner, reports, settings
    ├── ml/                  categorizer, analysis (forecast/anomaly/tips), ocr, chatbot
    └── services/            demo_data generator, mongo helpers
```

---

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**. Fully functional immediately — realistic
90-day demo dataset is generated on first load and persisted to `localStorage`.

### 2. Backend (optional, for real AI Assistant / OCR endpoints + MongoDB persistence)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # adjust MONGO_URI if needed
uvicorn main:app --reload
```

Runs at **http://localhost:8000** (interactive docs at `/docs`).

You'll need a MongoDB instance running. Easiest options:
- Local install: `mongod` (default port 27017, matches `.env.example`)
- Docker: `docker run -d -p 27017:27017 mongo`
- MongoDB Atlas: paste your connection string into `MONGO_URI` in `.env`

On first successful connection, the backend **automatically seeds** the database
with the same realistic demo dataset the frontend uses (transactions, income,
budgets, savings goals) — no manual setup step required.

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so once both
are running the frontend automatically talks to the real backend.

### 3. Receipt OCR (optional)

The OCR endpoint uses `pytesseract`, which wraps the Tesseract OCR binary.
- **macOS:** `brew install tesseract`
- **Ubuntu/Debian:** `sudo apt install tesseract-ocr`
- **Windows:** install from https://github.com/UB-Mannheim/tesseract/wiki

If Tesseract isn't installed, the `/api/scanner/ocr` endpoint automatically
falls back to a deterministic simulated extraction, so the Receipt Scanner
page keeps working either way.

---

## AI Features

| Feature | Where it lives |
|---|---|
| Automatic expense categorization | `backend/ml/categorizer.py` (keyword rules), mirrored in `frontend/src/lib/categories.js` |
| Spending habit analysis | `backend/ml/analysis.py::analyze_spending` (pandas aggregation) |
| Future expense prediction | `backend/ml/analysis.py::predict_next_month` (scikit-learn `LinearRegression`) |
| Unusual spending detection | `backend/ml/analysis.py::detect_anomalies` (z-score via numpy/pandas) |
| Budget suggestions | `backend/ml/analysis.py::suggest_budgets` |
| Personalized saving tips | `backend/ml/analysis.py::generate_saving_tips` |
| AI chatbot | `backend/ml/chatbot.py` + `/api/assistant/chat`, frontend fallback in `lib/ai.js` |
| Receipt OCR scanning | `backend/ml/ocr.py` (pytesseract) + `/api/scanner/ocr` |

---

## API Overview

All endpoints are prefixed with `/api`. Full interactive docs at `/docs` once
the backend is running.

- `GET/POST/PATCH/DELETE /api/transactions` — CRUD, supports `?category=` and `?q=` search
- `GET/POST/DELETE /api/incomes`
- `GET/POST/PATCH/DELETE /api/budgets`
- `GET/POST/PATCH/DELETE /api/goals`, `POST /api/goals/{id}/contribute`
- `GET /api/analytics/summary|forecast|anomalies|budget-suggestions|saving-tips`
- `POST /api/assistant/chat`
- `POST /api/scanner/ocr` (multipart file upload)
- `GET /api/reports/generate?period=this-month|last-month|last-3-months|year`
- `POST /api/settings/seed-demo-data`, `POST /api/settings/clear-all-data`

---

## Notes

- No external API keys are required anywhere — categorization, forecasting,
  anomaly detection, the chatbot, and OCR all run locally using classical
  ML/rule-based techniques, not a hosted LLM.
- Every button, form, and page is fully wired — there are no placeholder or
  "Coming Soon" screens.
- Dark/light mode is persisted in `localStorage` and respects the OS preference
  on first visit.
