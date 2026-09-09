"""
Pydantic schemas / MongoDB document models for SpendoraAI.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


CATEGORY_IDS = [
    "food", "groceries", "transport", "shopping", "entertainment",
    "bills", "health", "housing", "education", "travel",
    "subscriptions", "other",
]


class TransactionBase(BaseModel):
    merchant: str
    amount: float = Field(gt=0)
    category: Optional[str] = None
    note: Optional[str] = ""
    date: Optional[datetime] = None
    payment_method: Optional[str] = "Credit Card"


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    note: Optional[str] = None
    date: Optional[datetime] = None
    payment_method: Optional[str] = None


class TransactionOut(TransactionBase):
    id: str
    category: str
    date: datetime


class IncomeCreate(BaseModel):
    source: str
    amount: float = Field(gt=0)
    date: Optional[datetime] = None


class IncomeOut(IncomeCreate):
    id: str
    date: datetime


class BudgetCreate(BaseModel):
    category: str
    limit: float = Field(gt=0)
    period: Optional[str] = "monthly"


class BudgetUpdate(BaseModel):
    limit: float = Field(gt=0)


class BudgetOut(BudgetCreate):
    id: str


class GoalCreate(BaseModel):
    name: str
    target: float = Field(gt=0)
    saved: Optional[float] = 0
    deadline: Optional[datetime] = None
    icon: Optional[str] = "Target"
    color: Optional[str] = "#3b82f6"


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target: Optional[float] = None
    saved: Optional[float] = None
    deadline: Optional[datetime] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class GoalContribution(BaseModel):
    amount: float = Field(gt=0)


class GoalOut(GoalCreate):
    id: str
    saved: float


class ChatMessage(BaseModel):
    message: str


class ChatReply(BaseModel):
    reply: str
