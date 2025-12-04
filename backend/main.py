# backend/main.py
import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.classify import classify_transaction
from backend.feedback import load_merchants, add_merchant
from fastapi.middleware.cors import CORSMiddleware
from backend.insight_route import router as insight_router

app = FastAPI(title="Hybrid GenAI Transaction Categorizer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictInput(BaseModel):
    text: str
    force_llm: bool = False


class FeedbackInput(BaseModel):
    text: str
    correct_category: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: PredictInput):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    out = classify_transaction(payload.text, force_llm=payload.force_llm)
    return out


@app.post("/feedback")
def feedback(data: FeedbackInput):
    """
    Accepts user confirmation / correction and updates merchant map.
    This is intentionally conservative: only learns medium/high quality tokens,
    and excludes generic words.
    """
    text = data.text.lower()
    category = data.correct_category.lower().strip()

    # basic safety
    if category == "" or text.strip() == "":
        raise HTTPException(status_code=400, detail="invalid input")

    # load existing merchants
    merchants = load_merchants()

    # tokenize naive: split by whitespace (preprocessed version will canonicalize)
    words = [w for w in text.split() if len(w) > 2]

    learned = []
    # small blacklist of generic words that should not become merchants
    GENERIC_BLACKLIST = {"payment", "paid", "pay", "order", "upi", "transaction", "txn", "bill", "recharge"}

    for w in words:
        token = w.strip()
        if token in GENERIC_BLACKLIST:
            continue
        # add to merchant map
        add_merchant(token, category)
        learned.append(token)

    return {"status": "updated", "learned_merchants": learned, "category": category}

app.include_router(insight_router)