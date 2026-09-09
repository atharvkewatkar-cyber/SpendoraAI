"""
SpendoraAI backend — FastAPI application entry point.

Run with:
    uvicorn main:app --reload

On startup, this will:
  1. Attempt to connect to MongoDB (configured via .env / MONGO_URI).
  2. Create indexes if the connection succeeds.
  3. Seed demo data automatically if the transactions collection is empty,
     so the API returns realistic data immediately on a fresh setup.

If MongoDB is not running, the app still starts successfully — individual
endpoints will return connection errors, and the frontend's built-in local
fallback logic (lib/ai.js, DataContext) takes over transparently so the
demo remains fully functional either way.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import check_connection, create_indexes, transactions_collection
from services.demo_data import (
    generate_demo_transactions, generate_demo_incomes,
    generate_demo_budgets, generate_demo_goals,
)
from database import incomes_collection, budgets_collection, goals_collection

from routers import transactions, incomes, budgets, goals, analytics, assistant, scanner, reports, settings as settings_router


async def _auto_seed_if_empty():
    try:
        count = await transactions_collection.count_documents({})
        if count == 0:
            transactions = generate_demo_transactions()
            incomes = generate_demo_incomes()
            budgets = generate_demo_budgets()
            goals = generate_demo_goals()
            if transactions:
                await transactions_collection.insert_many(transactions)
            if incomes:
                await incomes_collection.insert_many(incomes)
            if budgets:
                await budgets_collection.insert_many(budgets)
            if goals:
                await goals_collection.insert_many(goals)
            print(f"[SpendoraAI] Seeded demo data: {len(transactions)} transactions, "
                  f"{len(incomes)} incomes, {len(budgets)} budgets, {len(goals)} goals.")
    except Exception as e:
        print(f"[SpendoraAI] Skipping auto-seed (MongoDB unavailable): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    connected = await check_connection()
    if connected:
        print("[SpendoraAI] Connected to MongoDB.")
        await create_indexes()
        await _auto_seed_if_empty()
    else:
        print("[SpendoraAI] WARNING: Could not connect to MongoDB. "
              "Start a local MongoDB instance (default: mongodb://localhost:27017) "
              "for full backend functionality. The frontend will use local fallback data.")
    yield
    # No explicit shutdown steps needed; Motor client closes on process exit.


app = FastAPI(
    title="SpendoraAI API",
    description="Backend for SpendoraAI – Personal Finance Assistant. Provides transaction, "
                "budget, and goal management plus AI-powered categorization, forecasting, "
                "anomaly detection, and a conversational assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(incomes.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(assistant.router)
app.include_router(scanner.router)
app.include_router(reports.router)
app.include_router(settings_router.router)


@app.get("/")
async def root():
    return {"name": "SpendoraAI API", "status": "running", "docs": "/docs"}


@app.get("/api/health")
async def health():
    db_connected = await check_connection()
    return {"status": "ok", "mongodb_connected": db_connected}
