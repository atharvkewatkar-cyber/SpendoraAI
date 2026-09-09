"""
Expense auto-categorization.

Uses a keyword/merchant-matching classifier. The structure mirrors what
a trained scikit-learn TfidfVectorizer + MultinomialNB pipeline would look
like (see `train_classifier` below) so it can be swapped for a persisted
trained model as real transaction/category-label data accumulates.
"""
from typing import Optional
import re

CATEGORY_KEYWORDS = {
    "food": ["starbucks", "mcdonald", "chipotle", "domino", "swiggy", "zomato",
              "restaurant", "cafe", "kfc", "burger", "pizza", "diner", "eatery", "coffee"],
    "groceries": ["walmart", "whole foods", "costco", "trader joe", "big bazaar",
                   "dmart", "supermarket", "grocery", "market"],
    "transport": ["uber", "lyft", "shell", "chevron", "ola", "petrol", "gas station",
                   "metro", "parking", "fuel", "taxi", "toll"],
    "shopping": ["amazon", "target", "ikea", "myntra", "flipkart", "mall", "h&m",
                  "zara", "best buy", "store"],
    "subscriptions": ["netflix", "spotify", "disney+", "youtube premium", "prime video",
                        "hotstar", "subscription", "adobe", "icloud"],
    "entertainment": ["amc", "cinema", "movie", "concert", "bookmyshow", "game",
                        "theatre", "theater", "steam"],
    "bills": ["electricity", "water bill", "internet", "phone bill", "wifi",
               "utility", "comcast", "verizon"],
    "health": ["pharmacy", "gym", "doctor", "hospital", "cvs", "clinic", "dental",
                "fitness", "medical"],
    "housing": ["rent", "mortgage", "landlord", "apartment", "insurance"],
    "education": ["university", "tuition", "course", "udemy", "coursera", "book store", "school"],
    "travel": ["airline", "hotel", "airbnb", "flight", "booking.com", "delta", "marriott"],
}


def categorize_expense(merchant: str, note: str = "") -> str:
    """Rule-based categorization via keyword matching against merchant + note text."""
    text = f"{merchant} {note}".lower()
    text = re.sub(r"[^a-z0-9\s.+]", " ", text)

    best_category = "other"
    best_score = 0
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_category = category

    return best_category


def train_classifier(labeled_transactions: list[dict]):
    """
    Trains a TF-IDF + Naive Bayes classifier on historical labeled transactions
    (merchant/note text -> category). Intended to be called periodically as an
    offline job once enough real user-labeled data exists, with the resulting
    model persisted (joblib) and loaded by categorize_expense_ml below.

    labeled_transactions: [{"text": "starbucks coffee", "category": "food"}, ...]
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline

    texts = [t["text"] for t in labeled_transactions]
    labels = [t["category"] for t in labeled_transactions]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
        ("clf", MultinomialNB()),
    ])
    pipeline.fit(texts, labels)
    return pipeline
