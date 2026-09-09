from datetime import datetime
from fastapi import APIRouter, HTTPException
from bson.errors import InvalidId

from database import incomes_collection
from models.schemas import IncomeCreate
from services.mongo_utils import serialize_doc, to_object_id

router = APIRouter(prefix="/api/incomes", tags=["incomes"])


@router.get("")
async def list_incomes(limit: int = 500):
    cursor = incomes_collection.find().sort("date", -1).limit(limit)
    return [serialize_doc(d) async for d in cursor]


@router.post("", status_code=201)
async def create_income(inc: IncomeCreate):
    doc = {
        "source": inc.source,
        "amount": inc.amount,
        "date": inc.date or datetime.utcnow(),
        "type": "income",
    }
    result = await incomes_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.delete("/{income_id}", status_code=204)
async def delete_income(income_id: str):
    try:
        oid = to_object_id(income_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid income id")
    result = await incomes_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found")
    return None
