from datetime import datetime
from fastapi import APIRouter, Query

from database import transactions_collection, incomes_collection, budgets_collection
from ml.analysis import analyze_spending, generate_saving_tips
from services.mongo_utils import serialize_doc

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _period_bounds(period: str):
    now = datetime.utcnow()
    if period == "this-month":
        start = datetime(now.year, now.month, 1)
        end = now
    elif period == "last-month":
        first_this_month = datetime(now.year, now.month, 1)
        end = first_this_month
        prev_month = now.month - 1 or 12
        prev_year = now.year if now.month != 1 else now.year - 1
        start = datetime(prev_year, prev_month, 1)
    elif period == "last-3-months":
        month = now.month - 3
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        start = datetime(year, month, 1)
        end = now
    elif period == "year":
        start = datetime(now.year, 1, 1)
        end = now
    else:
        start = datetime(now.year, now.month, 1)
        end = now
    return start, end


@router.get("/generate")
async def generate_report(period: str = Query("this-month")):
    start, end = _period_bounds(period)

    tx_cursor = transactions_collection.find({"date": {"$gte": start, "$lte": end}})
    transactions = [serialize_doc(d) async for d in tx_cursor]

    income_cursor = incomes_collection.find({"date": {"$gte": start, "$lte": end}})
    incomes = [serialize_doc(d) async for d in income_cursor]
    total_income = sum(i["amount"] for i in incomes)

    budgets_cursor = budgets_collection.find()
    budgets = [serialize_doc(d) async for d in budgets_cursor]

    analysis = analyze_spending(transactions)
    tips = generate_saving_tips(analysis, budgets, transactions)

    net_flow = total_income - analysis["total"]
    savings_rate = (net_flow / total_income * 100) if total_income > 0 else 0

    return {
        "period": period,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "income": round(total_income, 2),
        "expenses": analysis["total"],
        "net_flow": round(net_flow, 2),
        "savings_rate": round(savings_rate, 2),
        "by_category": analysis["by_category"],
        "top_category": analysis["top_category"],
        "transaction_count": len(transactions),
        "avg_transaction": round(analysis["total"] / len(transactions), 2) if transactions else 0,
        "insights": tips,
    }
