from datetime import datetime, timedelta
from fastapi import APIRouter

from database import transactions_collection, budgets_collection, incomes_collection
from ml.analysis import analyze_spending, predict_next_month, detect_anomalies, suggest_budgets, generate_saving_tips
from services.mongo_utils import serialize_doc

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


async def _get_transactions(days: int = None):
    query = {}
    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query["date"] = {"$gte": cutoff}
    cursor = transactions_collection.find(query)
    return [serialize_doc(d) async for d in cursor]


async def _get_budgets():
    cursor = budgets_collection.find()
    return [serialize_doc(d) async for d in cursor]


@router.get("/summary")
async def get_summary(days: int = 90):
    transactions = await _get_transactions(days)
    analysis = analyze_spending(transactions)
    return analysis


@router.get("/forecast")
async def get_forecast():
    """Forecasts next month's total spend using a linear regression over the last 6 months."""
    transactions = await _get_transactions(days=180)
    months = {}
    for t in transactions:
        d = t["date"]
        key = (d.year, d.month)
        months[key] = months.get(key, 0) + t["amount"]

    sorted_months = [months[k] for k in sorted(months.keys())]
    prediction = predict_next_month(sorted_months)
    return {"predicted_next_month": prediction, "historical_monthly_totals": sorted_months}


@router.get("/anomalies")
async def get_anomalies(days: int = 90, threshold: float = 2.0):
    transactions = await _get_transactions(days)
    anomalies = detect_anomalies(transactions, z_threshold=threshold)
    return anomalies


@router.get("/budget-suggestions")
async def get_budget_suggestions(days: int = 90):
    transactions = await _get_transactions(days)
    analysis = analyze_spending(transactions)
    suggestions = suggest_budgets(analysis["by_category"])
    return suggestions


@router.get("/saving-tips")
async def get_saving_tips(days: int = 30):
    transactions = await _get_transactions(days)
    budgets = await _get_budgets()
    analysis = analyze_spending(transactions)
    tips = generate_saving_tips(analysis, budgets, transactions)
    return tips
