# 🏗️ System Architecture

The system has three major layers:

---

## 1. Frontend (React + Vite)
- Handles user input
- Displays prediction cards
- Shows Merchant Memory
- Manages local state with Zustand
- Interacts with backend through REST API

Key Components:
- PredictionCard
- TransactionInput
- MerchantMemory
- Theme Toggle
- History Store (Zustand)
- Merchant Memory Store

---

## 2. Backend (FastAPI)
Runs a hybrid AI pipeline:

### Step 1 — ONNX Model
Fast, high-accuracy DistilBERT classifier.

### Step 2 — LLM Fallback
Used when ONNX confidence < threshold.

### Step 3 — Merchant Extraction
Uses:
- merchant_map.json  
- regex cleaning  
- fallback parsing rules  

### Step 4 — Output
Backend returns structured response:
```json
{
  "merchant": "dominos",
  "category": "Food & Dining",
  "confidence": 0.99,
  "explanation": "...",
  "token_attributions": [...],
  "used": "merchant_override"
}
