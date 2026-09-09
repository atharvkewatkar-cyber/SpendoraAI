"""
AI Assistant chatbot service.

Rule-based intent matching over the user's spending data. This is
intentionally dependency-free (no external LLM call) so the assistant
works fully offline/self-hosted, consistent with the rest of SpendoraAI's
"no external API keys required" design.
"""
import re
from typing import Dict, Any, List

from .analysis import analyze_spending, detect_anomalies


def _fmt(n: float) -> str:
    return f"${n:,.2f}"


def answer_query(query: str, transactions: List[Dict[str, Any]], budgets: List[Dict[str, Any]],
                  goals: List[Dict[str, Any]], income: float) -> str:
    q = query.lower()
    analysis = analyze_spending(transactions)
    by_category = analysis["by_category"]

    if re.search(r"how much.*(spend|spent).*(this month|month)", q) or "total spend" in q:
        top = analysis["top_category"] or "n/a"
        return (f"You've spent {_fmt(analysis['total'])} this period across {len(by_category)} categories. "
                f"Your biggest category is {top} at {_fmt(analysis['top_category_amount'])}.")

    if re.search(r"top categor|top spending|biggest expense|most.*spend|biggest categor", q):
        if not analysis["top_category"]:
            return "I don't see enough transactions yet to determine a top category."
        return f"Your top spending category is **{analysis['top_category']}**, totaling {_fmt(analysis['top_category_amount'])}."

    if "budget" in q:
        over = [b for b in budgets if by_category.get(b["category"], 0) > b["limit"]]
        if over:
            cats = ", ".join(b["category"] for b in over)
            return f"You're over budget in {len(over)} categor{'ies' if len(over) > 1 else 'y'}: {cats}. Want tips to get back on track?"
        return f"You're within budget across all {len(budgets)} tracked categories. Nice work!"

    if ("sav" in q and "goal" in q) or ("how are my" in q and "goal" in q):
        if not goals:
            return "You don't have any savings goals set up yet."
        g = goals[0]
        pct = round((g["saved"] / g["target"]) * 100) if g["target"] else 0
        return f"Your \"{g['name']}\" goal is {pct}% funded ({_fmt(g['saved'])} of {_fmt(g['target'])})."

    if re.search(r"predict|forecast|next month", q):
        daily_avg = analysis["avg_daily"]
        return f"Based on recent trends, I predict you'll spend around {_fmt(daily_avg * 30)} next month if habits stay similar."

    if re.search(r"unusual|anomal|weird", q):
        anomalies = detect_anomalies(transactions)
        if anomalies:
            top = anomalies[0]
            return f"I found {len(anomalies)} unusual transaction(s), the largest being {_fmt(top['amount'])} at {top['merchant']}."
        return "No unusual transactions detected recently — your spending looks consistent."

    if "income" in q:
        return f"Your recorded income this period is {_fmt(income)}."

    if re.search(r"hello|hi there|hey", q):
        return "Hey! I'm your AI expense assistant. Ask me about your spending, budgets, savings goals, or predictions."

    return (f"Here's a quick snapshot: total spend {_fmt(analysis['total'])}, "
            f"top category {analysis['top_category'] or 'n/a'}, "
            f"average daily spend {_fmt(analysis['avg_daily'])}. "
            f"Ask me something more specific, like \"how much did I spend on food\" or \"am I over budget?\"")
