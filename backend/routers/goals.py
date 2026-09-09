from fastapi import APIRouter, HTTPException
from bson.errors import InvalidId

from database import goals_collection
from models.schemas import GoalCreate, GoalUpdate, GoalContribution
from services.mongo_utils import serialize_doc, to_object_id

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("")
async def list_goals():
    cursor = goals_collection.find()
    return [serialize_doc(d) async for d in cursor]


@router.post("", status_code=201)
async def create_goal(goal: GoalCreate):
    doc = goal.model_dump()
    doc["saved"] = doc.get("saved") or 0
    result = await goals_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.patch("/{goal_id}")
async def update_goal(goal_id: str, update: GoalUpdate):
    try:
        oid = to_object_id(goal_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid goal id")

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await goals_collection.find_one_and_update(
        {"_id": oid}, {"$set": update_data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Goal not found")
    return serialize_doc(result)


@router.post("/{goal_id}/contribute")
async def contribute_to_goal(goal_id: str, contribution: GoalContribution):
    try:
        oid = to_object_id(goal_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid goal id")

    goal = await goals_collection.find_one({"_id": oid})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    new_saved = min(goal["target"], goal.get("saved", 0) + contribution.amount)
    result = await goals_collection.find_one_and_update(
        {"_id": oid}, {"$set": {"saved": new_saved}}, return_document=True
    )
    return serialize_doc(result)


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: str):
    try:
        oid = to_object_id(goal_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid goal id")
    result = await goals_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return None
