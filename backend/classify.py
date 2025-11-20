# backend/classify.py

import json
import os
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

from backend.preprocessing import preprocess
from backend.feedback import load_merchants, add_merchant
from backend.reasoner import llm_reason


# --------------------------------------------
# CATEGORY KEYWORD RULESETS (hard overrides)
# --------------------------------------------

AIRLINE_WORDS = [
    "flight","air india","airline","airways","indigo","vistara",
    "spicejet","airasia","akasa","goair","booking","ticket"
]

FUEL_WORDS = [
    "petrol","diesel","fuel","refill","pump","hp","bp","iocl","indianoil"
]

BILL_WORDS = [
    "bill","water bill","electricity","gas bill","lpg","recharge",
    "prepaid","postpaid","broadband","internet","fiber"
]

GROCERY_WORDS = [
    "mart","supermarket","grocery","dmart","bigbasket","jiomart",
    "fresh","hypermarket","bazaar","kirana"
]

HEALTH_WORDS = [
    "pharmacy","clinic","hospital","medical","medplus",
    "apollo","diagnostic","lab","scan"
]

ENT_WORDS = [
    "movie","cinema","ticket","pvr","inox","bookmyshow",
    "netflix","spotify","hotstar","zee5"
]

EDU_WORDS = [
    "class","coaching","tuition","institute","course",
    "learning","udemy","coursera","byjus","vedantu","training"
]


# --------------------------------------------
# MERCHANT DETECTION (with Jio exceptions)
# --------------------------------------------

def detect_merchant(text):
    merchants = load_merchants()
    # longest first (avoid “air” before “airtel”)
    merchants = dict(sorted(merchants.items(), key=lambda x: -len(x[0])))

    for m, cat in merchants.items():

        # special override for Jio logic
        if m == "jio":
            if any(x in text for x in ["recharge","postpaid","prepaid","fiber"]):
                return m, cat
            continue

        if m in text:
            return m, cat

    return None, None


# --------------------------------------------
# LOAD CATEGORIES + threshold
# --------------------------------------------

with open("data/categories.json", "r") as f:
    TAX = json.load(f)

THRESHOLD = float(TAX.get("confidence_threshold", 0.95))
CATEGORIES = TAX["categories"]

# MODEL LABEL → BACKEND CATEGORY
REAL_LABELS = {
    0:"food",1:"travel",2:"shopping",3:"fuel",4:"health",
    5:"groceries",6:"bills",7:"entertainment",8:"education",9:"others"
}

ID2CAT = REAL_LABELS.copy()

# MODEL LABEL → DISPLAY NAME ("Food & Dining")
ID2NAME = {
    idx: next(c["name"] for c in CATEGORIES if c["id"] == REAL_LABELS[idx])
    for idx in REAL_LABELS
}


# --------------------------------------------
# LOAD TOKENIZER + ONNX DISTILBERT MODEL
# --------------------------------------------

TOKENIZER_PATH = "models/tokenizer"
if os.path.exists(TOKENIZER_PATH):
    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)
else:
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

session = ort.InferenceSession(
    "models/distilbert.onnx",
    providers=["CPUExecutionProvider"]
)


# --------------------------------------------
# UTILS
# --------------------------------------------

def softmax(x):
    x = x - np.max(x)
    e = np.exp(x)
    return e / e.sum()

def get_token_attributions(text):
    try:
        toks = tokenizer.tokenize(text)
    except:
        return []
    return [{"token": t, "score": 0.3} for t in toks][:10]


# --------------------------------------------
# MAIN CLASSIFIER
# --------------------------------------------

def classify_transaction(text: str):
    clean = preprocess(text)

    # -------------------------------
    # 1) Merchant Override (strongest)
    # -------------------------------
    merchant, merchant_cat = detect_merchant(clean)

    if merchant_cat is not None:
        return {
            "category": next(c["name"] for c in CATEGORIES if c["id"] == merchant_cat),
            "confidence": 0.99,
            "explanation": f"Merchant '{merchant}' matched using merchant dictionary.",
            "token_attributions": [],
            "used": "merchant_override",
            "learning": "merchant-override"
        }

    # -------------------------------
    # 2) ONNX MODEL PREDICTION
    # -------------------------------
    encoded = tokenizer(
        clean,
        return_tensors="np",
        padding="max_length",
        truncation=True,
        max_length=64
    )

    inputs = session.get_inputs()
    ort_inputs = {
        inputs[0].name: encoded["input_ids"],
        inputs[1].name: encoded["attention_mask"]
    }

    logits = session.run(None, ort_inputs)[0][0]
    probs = softmax(logits)

    pred_id = int(np.argmax(probs))
    confidence = float(probs[pred_id])
    category_id = ID2CAT[pred_id]
    category_label = ID2NAME[pred_id]
    attribution = get_token_attributions(clean)

    # -------------------------------
    # 3) HARD RULE OVERRIDES
    # (if DistilBERT contradicts obvious semantics)
    # -------------------------------
    def any_in(words): return any(w in clean for w in words)

    force_fallback = False

    if any_in(AIRLINE_WORDS) and category_id != "travel": force_fallback = True
    if any_in(FUEL_WORDS) and category_id != "fuel": force_fallback = True
    if any_in(BILL_WORDS) and category_id != "bills": force_fallback = True
    if any_in(GROCERY_WORDS) and category_id != "groceries": force_fallback = True
    if any_in(HEALTH_WORDS) and category_id != "health": force_fallback = True
    if any_in(ENT_WORDS) and category_id != "entertainment": force_fallback = True
    if any_in(EDU_WORDS) and category_id != "education": force_fallback = True

    # -------------------------------
    # 4) AUTO-LEARNING OF MERCHANTS
    # -------------------------------
    if merchant is None:
        if confidence >= 0.98:
            candidate = clean.split()[0]
            add_merchant(candidate, category_id)
            learning_status = "auto-learned"
        elif confidence >= 0.70:
            learning_status = "needs-confirmation"
        else:
            learning_status = "llm-fallback"
    else:
        learning_status = "merchant-override"

    # -------------------------------
    # 5) LLM FALLBACK LOGIC (Qwen2.5)
    # -------------------------------
    if confidence < THRESHOLD or force_fallback:
        llm_out = llm_reason(clean, category_id, attribution)

        return {
            "category": llm_out["category"],
            "confidence": llm_out["confidence"],
            "explanation": llm_out["explanation"],
            "token_attributions": attribution,
            "used": "llm_fallback",
            "learning": "llm-fallback"
        }

    # -------------------------------
    # 6) RETURN DISTILBERT RESULT
    # -------------------------------
    return {
        "category": category_label,
        "confidence": confidence,
        "explanation": "Predicted via ONNX DistilBERT classifier.",
        "token_attributions": attribution,
        "used": "onnx",
        "learning": learning_status
    }


# --------------------------------------------
# Local test
# --------------------------------------------
if __name__ == "__main__":
    print(classify_transaction("PAYTM ZOMATO ORDER 199"))
    print(classify_transaction("UBER TRIP 234"))
    print(classify_transaction("AIRTEL BILL PAYMENT"))