# 🛒 Merchant Memory Module

Merchant Memory is a self-learning system that tracks spending behavior.

---

## 🧱 Structure

Each merchant stores:
```json
{
  "internalName": "dominos",
  "displayName": "Dominos",
  "category": "food",
  "total": 3250,
  "visits": 4
}

🔍 How merchants are detected

We use:

merchant_map.json (known merchants)

Normalization rules:

lowercase

remove punctuation

collapse spaces

AI fallback extraction:

ignore the word before the amount

ignore filler words: "order", "monthly", "booking", etc.
"dominos order 750" → "dominos"
"bharat petrol payment 500" → "bharat petrol"
"smart class monthly 899" → "smart class"
