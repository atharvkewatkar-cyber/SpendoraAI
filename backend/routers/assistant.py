from datetime import datetime, timedelta
from fastapi import APIRouter

from database import transactions_collection, budgets_collection, goals_collection, incomes_collection
from models.schemas import ChatMessage, ChatReply
from ml.chatbot import answer_query
from services.mongo_utils import serialize_doc

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatReply)
async def chat(message: ChatMessage):
    cutoff = datetime.utcnow() - timedelta(days=30)

    tx_cursor = transactions_collection.find({"date": {"$gte": cutoff}})
    transactions = [serialize_doc(d) async for d in tx_cursor]

    budgets_cursor = budgets_collection.find()
    budgets = [serialize_doc(d) async for d in budgets_cursor]

    goals_cursor = goals_collection.find()
    goals = [serialize_doc(d) async for d in goals_cursor]

    income_cursor = incomes_collection.find({"date": {"$gte": cutoff}})
    incomes = [serialize_doc(d) async for d in income_cursor]
    total_income = sum(i["amount"] for i in incomes)

    reply = answer_query(message.message, transactions, budgets, goals, total_income)
    return ChatReply(reply=reply)
