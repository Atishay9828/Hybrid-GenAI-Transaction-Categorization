import html
import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

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
# ⚠️ LOCAL LLM FUNCTION (update this)
# -------------------------------
from backend.llm import run_local_llm

# -------------------------------
# Prompt builder
# -------------------------------
def build_prompt(tx: InsightTxn, history: List[InsightTxn]) -> str:
    t_text = html.escape(tx.text)
    cat = tx.category or "Unknown"

    amount = 0
    try:
        import re
        amt_match = re.search(r"\d+", t_text)
        if amt_match:
            amount = int(amt_match.group())
    except:
        pass

    # Build compact history
    history_lines = []
    for h in history[-12:]:
        ts = time.strftime("%Y-%m-%d %H:%M", time.localtime(h.timestamp / 1000))
        amt = ""
        try:
            import re
            amt = re.search(r"\d+", h.text)
            amt = amt.group() if amt else "?"
        except:
            amt = "?"

        history_lines.append(
            f"- {ts} | ₹{amt} | {html.escape(h.text)} | {h.category}"
        )

    history_block = "\n".join(history_lines) if history_lines else "No relevant historical spending found."

    return f"""
        You are a personal finance assistant that generates *short, smart, actionable insights*.

        User transaction:
        Text: "{t_text}"
        Category: {cat}
        Amount: ₹{amount}

        Recent spending history:
        {history_block}

        Your task:
        1. Identify what this transaction means.
        2. Detect patterns from recent spending.
        3. If spending is high/low compared to history, mention it.
        4. Give 1 short actionable suggestion.
        5. Keep it polite, helpful, and **under 3 sentences**.
        6. NEVER hallucinate merchants or amounts.

        Write the insight in friendly tone.
        """

# -------------------------------
# API Endpoint
# -------------------------------
@router.post("/transaction-insight")
def transaction_insight(req: InsightRequest):
    key = f"{req.transaction.text}-{req.transaction.timestamp}"

    # If cached → return instantly
    if key in INSIGHT_CACHE:
        return {"insight": INSIGHT_CACHE[key]}

    try:
        tx = req.transaction
        history = req.recent_history[-12:]  # limit to 12

        prompt = build_prompt(tx, history)
        out = run_local_llm(prompt)

        INSIGHT_CACHE[key] = out.strip()   # Save for next time

        return {"insight": out.strip()}

    except Exception as e:
        logging.exception("INSIGHT FAILURE")
        raise HTTPException(status_code=500, detail="Insight generation failed")