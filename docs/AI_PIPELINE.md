# 🤖 Hybrid AI Pipeline

The classification process runs in this order:

## 1. Merchant Extraction
- merchant_map.json lookup → if match, use it
- normalized parsing fallback
- intelligent extraction around numbers

## 2. ONNX Model Prediction
- DistilBERT ONNX runtime
- Fast, lightweight, powerful
- Returns probability distribution across categories

## 3. LLM Fallback
Triggered when:
- ONNX confidence < threshold (e.g., 0.60)
- Transaction text is ambiguous

LLM returns:
- category
- reasoning/explanation

## 4. Hybrid Output
Response always includes:
- merchant
- category
- confidence
- explanation
- engine used
- token attribution

This hybrid flow ensures **speed + accuracy + robustness**.
