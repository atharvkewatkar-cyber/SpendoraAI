"""
Spending analysis, forecasting, and anomaly detection.
Uses pandas for aggregation, numpy for stats, and scikit-learn's
LinearRegression for the forecast model.
"""
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def _to_dataframe(transactions: List[Dict[str, Any]]) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame(columns=["merchant", "amount", "category", "date"])
    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    return df


def analyze_spending(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    df = _to_dataframe(transactions)
    if df.empty:
        return {"total": 0, "by_category": {}, "top_category": None, "top_category_amount": 0, "avg_daily": 0}

    total = float(df["amount"].sum())
    by_category = df.groupby("category")["amount"].sum().sort_values(ascending=False)
    top_category = by_category.index[0] if len(by_category) else None
    top_category_amount = float(by_category.iloc[0]) if len(by_category) else 0

    date_span = (df["date"].max() - df["date"].min()).days or 1
    avg_daily = total / date_span

    return {
        "total": round(total, 2),
        "by_category": {k: round(float(v), 2) for k, v in by_category.items()},
        "top_category": top_category,
        "top_category_amount": round(top_category_amount, 2),
        "avg_daily": round(avg_daily, 2),
    }


def predict_next_month(monthly_totals: List[float]) -> float:
    """Linear regression forecast of next month's total spend given historical monthly totals."""
    n = len(monthly_totals)
    if n == 0:
        return 0.0
    if n == 1:
        return round(monthly_totals[0], 2)

    X = np.arange(n).reshape(-1, 1)
    y = np.array(monthly_totals)

    model = LinearRegression()
    model.fit(X, y)
    prediction = model.predict([[n]])[0]
    return round(max(0.0, float(prediction)), 2)


def detect_anomalies(transactions: List[Dict[str, Any]], z_threshold: float = 2.0) -> List[Dict[str, Any]]:
    """Flags transactions whose amount z-score exceeds the threshold (unusual spending)."""
    df = _to_dataframe(transactions)
    if len(df) < 3:
        return []

    mean = df["amount"].mean()
    std = df["amount"].std() or 1.0
    df["z_score"] = (df["amount"] - mean) / std

    anomalies = df[df["z_score"] > z_threshold].sort_values("z_score", ascending=False)
    results = []
    for _, row in anomalies.iterrows():
        results.append({
            "merchant": row["merchant"],
            "amount": round(float(row["amount"]), 2),
            "category": row["category"],
            "date": row["date"].isoformat(),
            "z_score": round(float(row["z_score"]), 2),
        })
    return results


def suggest_budgets(by_category: Dict[str, float]) -> Dict[str, float]:
    """Suggests monthly budget limits based on historical average spend per category."""
    essentials = {"housing", "groceries", "bills", "health", "transport"}
    suggestions = {}
    for category, amount in by_category.items():
        factor = 0.97 if category in essentials else 0.85
        suggested = round(amount * factor)
        suggestions[category] = max(suggested, 20)
    return suggestions


def generate_saving_tips(analysis: Dict[str, Any], budgets: List[Dict[str, Any]], transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    tips = []
    by_category = analysis.get("by_category", {})

    df = _to_dataframe(transactions)
    if not df.empty:
        subs = df[df["category"] == "subscriptions"]
        if len(subs) >= 3:
            sub_total = float(subs["amount"].sum())
            tips.append({
                "icon": "Repeat",
                "title": "Review your subscriptions",
                "detail": f"You have {len(subs)} active subscriptions costing ${sub_total:.2f}/mo. Cancelling underused ones could save ${sub_total * 0.3:.0f}+ monthly.",
                "impact": round(sub_total * 0.3),
            })

    if by_category.get("food", 0) > 350:
        tips.append({
            "icon": "Utensils",
            "title": "Dining out is adding up",
            "detail": f"You spent ${by_category['food']:.0f} on food. Cooking more meals at home could save roughly ${by_category['food'] * 0.2:.0f}/month.",
            "impact": round(by_category["food"] * 0.2),
        })

    if by_category.get("shopping", 0) > 300:
        tips.append({
            "icon": "ShoppingBag",
            "title": "Set a shopping cooldown",
            "detail": f"Impulse shopping totals ${by_category['shopping']:.0f}. Try a 24-hour rule before non-essential purchases over $50.",
            "impact": round(by_category["shopping"] * 0.15),
        })

    for b in budgets:
        spent = by_category.get(b["category"], 0)
        if spent > b["limit"]:
            tips.append({
                "icon": "AlertTriangle",
                "title": f"Over budget on {b['category']}",
                "detail": f"You've exceeded your ${b['limit']} budget by ${spent - b['limit']:.0f}.",
                "impact": round(spent - b["limit"]),
            })

    if not tips:
        tips.append({
            "icon": "ThumbsUp",
            "title": "Great job staying on track!",
            "detail": "Your spending looks balanced across categories.",
            "impact": 0,
        })

    return tips[:6]
