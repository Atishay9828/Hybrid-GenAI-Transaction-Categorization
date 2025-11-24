# backend/insight_route.py
import html
import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import hashlib

router = APIRouter()
INSIGHT_CACHE = {}

# -------------------------------
# Input Models
# -------------------------------
class InsightTxn(BaseModel):
    text: str
    timestamp: int
    merchant: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    engine: Optional[str] = None

class InsightRequest(BaseModel):
    transaction: InsightTxn
    recent_history: List[InsightTxn] = []

# -------------------------------
# LOCAL LLM FUNCTION (must exist)
# -------------------------------
# IMPORTANT: this must point to whatever module exposes run_local_llm
from backend.llm import run_local_llm

# -------------------------------
# Prompt builder
# -------------------------------
def build_prompt(tx: InsightTxn, history: List[InsightTxn]) -> str:
    t_text = html.escape(tx.text)
    cat = tx.category or "Unknown"

    import re
    amt_match = re.search(r"\d+", t_text)
    amount = int(amt_match.group()) if amt_match else 0

    history_lines = []
    for h in history[-3:]:
        match = re.search(r"\d+", h.text)
        amt = match.group() if match else "?"
        history_lines.append(f"- ₹{amt} | {html.escape(h.text)}")

    history_block = "\n".join(history_lines) if history_lines else "None"

    return f"""
        You are a financial assistant.
        Your job is to generate ONE clean insight about this spending.

        RULES:
        - Only 1–2 sentences.
        - No conversations.
        - Do NOT output 'Human:' or 'User:'.
        - Do NOT continue the dialogue.
        - Do NOT ask questions.
        - ONLY output the final insight text.
        - Be friendly and concise.

        Transaction:
        Text: "{t_text}"
        Category: {cat}
        Amount: ₹{amount}

        Recent history:
        {history_block}

        Write the final insight now:
        """
# -------------------------------
# Helper: safer cache key
# -------------------------------
def make_cache_key(text: str, ts: int) -> str:
    base = f"{text}-{ts}"
    # short hash suffix to avoid accidental collisions, keep human readable
    h = hashlib.sha1(base.encode("utf-8")).hexdigest()[:8]
    return f"{base}-{h}"

# -------------------------------
# API Endpoint
# -------------------------------
@router.post("/transaction-insight")
def transaction_insight(req: InsightRequest):
    key = make_cache_key(req.transaction.text, req.transaction.timestamp)

    if key in INSIGHT_CACHE:
        return {"insight": INSIGHT_CACHE[key]}

    try:
        tx = req.transaction
        history = req.recent_history[-3:]  # limit to 12

        prompt = build_prompt(tx, history)
        logging.info("INSIGHT PROMPT: %s", prompt[:1000])  # log first chunk

        # call local LLM
        out = run_local_llm(prompt)

        # debug: log raw output (trimmed)
        logging.info("RAW LLM OUTPUT (trimmed 2000 chars): %s", str(out)[:2000])

        clean = (out or "").strip()

        INSIGHT_CACHE[key] = clean
        return {"insight": clean}

    except Exception as e:
        logging.exception("INSIGHT FAILURE")
        # return 500 so client can detect and show friendly message
        raise HTTPException(status_code=500, detail="Insight generation failed")

# --------------------------------------------
# NEW: Batch Insight Endpoint
# --------------------------------------------
class BatchRequest(BaseModel):
    transactions: List[InsightTxn]
    recent_history: List[InsightTxn] = []

@router.post("/transaction-insight-batch")
def transaction_insight_batch(req: BatchRequest):
    results = {}
    try:
        for tx in req.transactions:
            key = make_cache_key(tx.text, tx.timestamp)

            # Already cached → skip LLM
            if key in INSIGHT_CACHE:
                results[key] = INSIGHT_CACHE[key]
                continue

            # Build and run
            prompt = build_prompt(tx, req.recent_history or [])
            logging.info("BATCH PROMPT for %s: %s", key, prompt[:400])

            out = run_local_llm(prompt)
            clean = (out or "").strip()

            # Save
            INSIGHT_CACHE[key] = clean
            results[key] = clean

        return {"insights": results}

    except Exception:
        logging.exception("BATCH INSIGHT FAILURE")
        raise HTTPException(status_code=500, detail="Batch insight generation failed")