# 🔧 Backend Documentation (FastAPI)

Backend stack:
- Python 3.11
- FastAPI
- Pydantic
- ONNX Runtime
- Custom merchant extractor

---

## 🛠️ Predict Endpoint

### POST `/predict`

```json
{
  "text": "dominos order 750"
}
Response : 
{
  "merchant": "dominos",
  "category": "Food & Dining",
  "confidence": 0.99,
  "explanation": "...",
  "token_attributions": [...],
  "used": "onnx"
}
