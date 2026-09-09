"""
MongoDB connection handling via Motor (async driver).
Falls back gracefully: if MongoDB is not reachable, routers catch the
exception and the frontend's local fallback logic takes over — so the
app remains fully usable even without a running Mongo instance.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "spendoraai")

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client[MONGO_DB_NAME]

# Collections
transactions_collection = db["transactions"]
incomes_collection = db["incomes"]
budgets_collection = db["budgets"]
goals_collection = db["goals"]
users_collection = db["users"]


async def check_connection() -> bool:
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False


async def create_indexes():
    """Create useful indexes for query performance. Safe to call repeatedly."""
    try:
        await transactions_collection.create_index("date")
        await transactions_collection.create_index("category")
        await transactions_collection.create_index("user_id")
        await budgets_collection.create_index("category")
        await goals_collection.create_index("user_id")
    except Exception:
        # Mongo not available — app continues without indexes.
        pass
