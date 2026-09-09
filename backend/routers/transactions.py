from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from bson.errors import InvalidId

from database import transactions_collection
from models.schemas import TransactionCreate, TransactionUpdate
from ml.categorizer import categorize_expense
from services.mongo_utils import serialize_doc, to_object_id

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    category: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(500, le=2000),
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if q:
        query["$or"] = [
            {"merchant": {"$regex": q, "$options": "i"}},
            {"note": {"$regex": q, "$options": "i"}},
        ]

    cursor = transactions_collection.find(query).sort("date", -1).limit(limit)
    docs = [serialize_doc(d) async for d in cursor]
    return docs


@router.post("", status_code=201)
async def create_transaction(tx: TransactionCreate):
    category = tx.category or categorize_expense(tx.merchant, tx.note or "")
    doc = {
        "merchant": tx.merchant,
        "amount": tx.amount,
        "category": category,
        "note": tx.note or "",
        "date": tx.date or datetime.utcnow(),
        "payment_method": tx.payment_method or "Credit Card",
        "type": "expense",
    }
    result = await transactions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.patch("/{tx_id}")
async def update_transaction(tx_id: str, updates: TransactionUpdate):
    try:
        oid = to_object_id(tx_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid transaction id")

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await transactions_collection.find_one_and_update(
        {"_id": oid}, {"$set": update_data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return serialize_doc(result)


@router.delete("/{tx_id}", status_code=204)
async def delete_transaction(tx_id: str):
    try:
        oid = to_object_id(tx_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid transaction id")

    result = await transactions_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None
