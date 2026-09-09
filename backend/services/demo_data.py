"""
Generates realistic demo data (transactions, income, budgets, goals) for
seeding MongoDB on first run, mirroring the frontend's local demo dataset
so behavior is consistent whether the backend is connected or not.
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

MERCHANTS = {
    "food": ["Starbucks", "Chipotle Mexican Grill", "McDonald's", "Local Cafe", "Domino's Pizza", "Sushi Palace"],
    "groceries": ["Whole Foods Market", "Walmart Supercenter", "Trader Joe's", "Costco Wholesale"],
    "transport": ["Uber", "Lyft", "Shell Gas Station", "Metro Transit Card", "City Parking Authority"],
    "shopping": ["Amazon", "Target", "IKEA", "Best Buy", "Zara", "H&M"],
    "entertainment": ["AMC Theatres", "Steam Games", "BookMyShow", "Local Concert Hall", "Bowling Alley"],
    "bills": ["Pacific Electric Co.", "CityWater Utility", "Comcast Internet", "Verizon Wireless"],
    "health": ["CVS Pharmacy", "Gold's Gym", "City Dental Clinic", "Walgreens"],
    "housing": ["Maple Apartments LLC", "Home Insurance Co."],
    "education": ["Udemy", "Coursera", "University Bookstore"],
    "travel": ["Delta Airlines", "Airbnb", "Marriott Hotels", "Booking.com"],
    "subscriptions": ["Netflix", "Spotify Premium", "Disney+", "Adobe Creative Cloud", "iCloud Storage"],
    "other": ["ATM Withdrawal", "Gift Purchase", "Miscellaneous"],
}

CATEGORY_WEIGHTS = {
    "food": 0.16, "groceries": 0.14, "transport": 0.09, "shopping": 0.13,
    "entertainment": 0.07, "bills": 0.10, "health": 0.06, "housing": 0.16,
    "education": 0.03, "travel": 0.02, "subscriptions": 0.03, "other": 0.01,
}

AMOUNT_RANGES = {
    "food": (8, 45), "groceries": (25, 140), "transport": (6, 60), "shopping": (15, 220),
    "entertainment": (10, 90), "bills": (40, 180), "health": (15, 150), "housing": (900, 1450),
    "education": (20, 300), "travel": (80, 650), "subscriptions": (6, 20), "other": (5, 100),
}

PAYMENT_METHODS = ["Credit Card", "Debit Card", "Cash", "UPI"]


def _weighted_category(rng: random.Random) -> str:
    r = rng.random()
    acc = 0.0
    for cat, w in CATEGORY_WEIGHTS.items():
        acc += w
        if r <= acc:
            return cat
    return "other"


def _amount_for(category: str, rng: random.Random) -> float:
    lo, hi = AMOUNT_RANGES.get(category, (5, 100))
    return round(rng.uniform(lo, hi), 2)


def generate_demo_transactions(days: int = 90, seed: int = 42) -> List[Dict[str, Any]]:
    rng = random.Random(seed)
    txs = []
    today = datetime.now()

    for d in range(days, -1, -1):
        date = today - timedelta(days=d)
        day_of_month = date.day

        if day_of_month == 1:
            txs.append({"date": date, "category": "housing", "merchant": "Maple Apartments LLC",
                        "amount": _amount_for("housing", rng), "note": "Monthly rent",
                        "type": "expense", "payment_method": rng.choice(PAYMENT_METHODS)})
        if day_of_month == 5:
            txs.append({"date": date, "category": "bills", "merchant": "Pacific Electric Co.",
                        "amount": _amount_for("bills", rng), "note": "Electricity bill",
                        "type": "expense", "payment_method": rng.choice(PAYMENT_METHODS)})
        if day_of_month == 7:
            txs.append({"date": date, "category": "subscriptions", "merchant": "Netflix",
                        "amount": 15.99, "note": "Monthly subscription",
                        "type": "expense", "payment_method": "Credit Card"})
            txs.append({"date": date, "category": "subscriptions", "merchant": "Spotify Premium",
                        "amount": 10.99, "note": "Monthly subscription",
                        "type": "expense", "payment_method": "Credit Card"})
        if day_of_month == 15:
            txs.append({"date": date, "category": "health", "merchant": "Gold's Gym",
                        "amount": 45, "note": "Monthly membership",
                        "type": "expense", "payment_method": "Credit Card"})

        num_tx = rng.randint(0, 2)
        for _ in range(num_tx):
            cat = _weighted_category(rng)
            merchant = rng.choice(MERCHANTS[cat])
            txs.append({"date": date, "category": cat, "merchant": merchant,
                        "amount": _amount_for(cat, rng), "note": "",
                        "type": "expense", "payment_method": rng.choice(PAYMENT_METHODS)})

        if d == 23:
            txs.append({"date": date, "category": "shopping", "merchant": "Best Buy",
                        "amount": 890, "note": "Laptop purchase", "type": "expense", "payment_method": "Credit Card"})
        if d == 47:
            txs.append({"date": date, "category": "travel", "merchant": "Delta Airlines",
                        "amount": 620, "note": "Flight booking", "type": "expense", "payment_method": "Credit Card"})

    return txs


def generate_demo_incomes() -> List[Dict[str, Any]]:
    today = datetime.now()
    incomes = []
    for m in range(3, -1, -1):
        month = today.month - m
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        incomes.append({"date": datetime(year, month, 1), "source": "Salary - TechCorp Inc.", "amount": 3200, "type": "income"})
        incomes.append({"date": datetime(year, month, 15), "source": "Salary - TechCorp Inc.", "amount": 3200, "type": "income"})
    incomes.append({"date": datetime(today.year, today.month, 20), "source": "Freelance Project", "amount": 450, "type": "income"})
    return incomes


def generate_demo_budgets() -> List[Dict[str, Any]]:
    return [
        {"category": "food", "limit": 450, "period": "monthly"},
        {"category": "groceries", "limit": 500, "period": "monthly"},
        {"category": "transport", "limit": 200, "period": "monthly"},
        {"category": "shopping", "limit": 350, "period": "monthly"},
        {"category": "entertainment", "limit": 150, "period": "monthly"},
        {"category": "bills", "limit": 350, "period": "monthly"},
        {"category": "health", "limit": 120, "period": "monthly"},
        {"category": "subscriptions", "limit": 60, "period": "monthly"},
    ]


def generate_demo_goals() -> List[Dict[str, Any]]:
    today = datetime.now()

    def add_months(n):
        month = today.month - 1 + n
        year = today.year + month // 12
        month = month % 12 + 1
        return datetime(year, month, min(today.day, 28))

    return [
        {"name": "Emergency Fund", "target": 10000, "saved": 6450, "deadline": add_months(6), "icon": "ShieldCheck", "color": "#22c55e"},
        {"name": "Japan Trip 2027", "target": 4500, "saved": 1820, "deadline": add_months(9), "icon": "Plane", "color": "#f59e0b"},
        {"name": "New MacBook Pro", "target": 2500, "saved": 2500, "deadline": add_months(1), "icon": "Laptop", "color": "#3b82f6"},
        {"name": "Home Down Payment", "target": 50000, "saved": 12300, "deadline": add_months(30), "icon": "Home", "color": "#8b5cf6"},
    ]
