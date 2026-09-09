from fastapi import APIRouter, HTTPException
from bson.errors import InvalidId

from database import budgets_collection
from models.schemas import BudgetCreate, BudgetUpdate
from services.mongo_utils import serialize_doc, to_object_id

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.get("")
async def list_budgets():
    cursor = budgets_collection.find()
    return [serialize_doc(d) async for d in cursor]


@router.post("", status_code=201)
async def create_or_update_budget(budget: BudgetCreate):
    existing = await budgets_collection.find_one({"category": budget.category})
    if existing:
        await budgets_collection.update_one(
            {"category": budget.category}, {"$set": {"limit": budget.limit, "period": budget.period}}
        )
        updated = await budgets_collection.find_one({"category": budget.category})
        return serialize_doc(updated)

    doc = {"category": budget.category, "limit": budget.limit, "period": budget.period or "monthly"}
    result = await budgets_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.patch("/{budget_id}")
async def update_budget(budget_id: str, update: BudgetUpdate):
    try:
        oid = to_object_id(budget_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid budget id")

    result = await budgets_collection.find_one_and_update(
        {"_id": oid}, {"$set": {"limit": update.limit}}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Budget not found")
    return serialize_doc(result)


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(budget_id: str):
    try:
        oid = to_object_id(budget_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid budget id")
    result = await budgets_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return None
