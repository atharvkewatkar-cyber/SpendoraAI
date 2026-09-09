from fastapi import APIRouter

from database import transactions_collection, incomes_collection, budgets_collection, goals_collection
from services.demo_data import (
    generate_demo_transactions, generate_demo_incomes,
    generate_demo_budgets, generate_demo_goals,
)

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.post("/seed-demo-data")
async def seed_demo_data():
    """Wipes existing collections and reseeds with realistic demo data."""
    await transactions_collection.delete_many({})
    await incomes_collection.delete_many({})
    await budgets_collection.delete_many({})
    await goals_collection.delete_many({})

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

    return {
        "status": "ok",
        "transactions": len(transactions),
        "incomes": len(incomes),
        "budgets": len(budgets),
        "goals": len(goals),
    }


@router.post("/clear-all-data")
async def clear_all_data():
    """Deletes all data across every collection."""
    await transactions_collection.delete_many({})
    await incomes_collection.delete_many({})
    await budgets_collection.delete_many({})
    await goals_collection.delete_many({})
    return {"status": "ok"}
