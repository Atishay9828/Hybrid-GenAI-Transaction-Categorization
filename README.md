# 🚀 Hybrid GenAI Transaction Categorization

[![Build Status](https://github.com/Atishay9828/Hybrid-GenAI-Transaction-Categorization/actions/workflows/ci.yml/badge.svg)](https://github.com/Atishay9828/Hybrid-GenAI-Transaction-Categorization/actions)
![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![AI Pipeline](https://img.shields.io/badge/AI-Hybrid%20ONNX%20%2B%20LLM-purple)

A modern AI-powered transaction categorization system blending **ONNX**, **LLM fallback**, and a **self-learning Merchant Memory module**.

Built by **Atishay Jain**.

---

## 🔥 Overview

This project reads natural-language transaction text like:

```
dominos order 750 
bharat petrol payment 500 
smart class monthly 899 
volvo bus booking 1200
```

And automatically predicts:

- **Category** (Food, Groceries, Travel, Fuel, Bills, etc.)
- **Merchant** (Dominos, Bharat Petrol, Volvo, etc.)
- **Confidence score**
- **Explanation**
- **Token attribution**

The frontend displays predictions beautifully, and the Merchant Memory module learns your spending patterns over time.

---

## ✨ Key Features

### 🧠 **Hybrid AI Model**
- Primary: **ONNX DistilBERT**  
- Fallback: **Large Language Model**  
- Auto-selects model based on confidence  
- Fast, accurate, reliable  

**Model Training:**
- Trained on **Google Colab** → [View Training Notebook](https://colab.research.google.com/drive/1Foi8sGqDq3nYCUje-8Fi0Sk_BbK67MlD)
- Dataset: **1,500 rows of synthetic transaction data**
- Categories: **10 transaction categories** (Food, Groceries, Travel, Fuel, Bills, Shopping, Health, Entertainment, Education, Others)
- **Fully offline-capable** using LLM fallback when ONNX model is unavailable
- Category definitions in [`categoryColors.js`](frontend/src/utils/categoryColors.js)

### 🛒 **Smart Merchant Memory System**
- Auto-detect merchants using:
  - **merchant_map.json** (known vendors)
  - AI fallback for unknown merchants  
- Handles inputs like:
The frontend displays predictions beautifully, and the Merchant Memory module learns your spending patterns over time.

---

## ✨ Key Features

### 🧠 **Hybrid AI Model**
- Primary: **ONNX DistilBERT**  
- Fallback: **Large Language Model**  
- Auto-selects model based on confidence  
- Fast, accurate, reliable  

### 🛒 **Smart Merchant Memory System**
- Auto-detect merchants using:
  - **merchant_map.json** (known vendors)
  - AI fallback for unknown merchants  
- Handles inputs like:
  - "dominos 750"
  - "domino's pizza payment 450"
  - "swiggy order 569"
- Groups transactions by merchant  
- Tracks:
  - total spent  
  - visit count  
  - average spend  
  - individual transaction history  
- Expandable merchant cards with analytics  

### 💅 **Beautiful Frontend**
- React + Vite + TailwindCSS  
- Dark mode with glass UI  
- Smooth transitions  
- Category color-coding  
- Token attribution display  

### ⚡ **FastAPI Backend**
- `/predict` endpoint  

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --port 8000
```

Runs on:  
👉 http://localhost:8000

### **Frontend (React + Vite)**

```bash
cd frontend
npm install
npm run dev
```

Runs on:  
👉 http://localhost:5173

### **🐳 Run Entire Project With Docker**

Just one command:

```bash
docker-compose up --build
```

- Frontend → http://localhost:5173
- Backend → http://localhost:8000

---

## ⚙️ Environment Variables

**backend/.env.example**

```env
PREDICT_PORT=8000
MODEL_PATH=./models/model.onnx
LOG_LEVEL=info
```

**frontend/.env.example**

```env
VITE_API_URL=http://localhost:8000
```

---

## 🔍 How Prediction Works

1. **User enters text:**
   ```
   "dominos order 750"
   ```

2. **Backend extracts:**
   - merchant: `"dominos"`
   - amount: `750`

3. **ONNX model predicts category**

4. **LLM fallback used if low confidence**

5. **Merchant Memory updates:**
   - `visits++`
   - `total spend++`

6. **Frontend displays:**
   - category
   - confidence bar
   - merchant card
   - explanation
   - token attribution

---

## 🛒 Merchant Extraction Logic

The smart extractor handles:

- removing filler words
- ignoring the word before the number
- normalizing punctuation
- using custom merchant_map
- fallback merchant derivation

**Examples:**

| Input | Extracted Merchant |
|-------|-------------------|
| `dominos order 750` | dominos |
| `smart class monthly 899` | smart class |
| `bharat petrol payment 500` | bharat petrol |
| `volvo bus booking 1200` | volvo bus |

---

## 🎨 UI Showcase

> Place in: `/frontend/public/screenshots/`

Then embed here:

```markdown
![Prediction UI](public/screenshots/predict.png)
![Merchant Memory](public/screenshots/memory.png)
```

---

## 🤖 CI/CD (GitHub Actions)

A workflow is included in:

```
.github/workflows/ci.yml
```

It checks:

- frontend builds correctly
- backend installs correctly
- tests run (if added)

---

## 🔥 Future Improvements

- Spend analytics graph
- Weekly/monthly reports
- Export data as CSV
- OCR for reading receipts
- Fine-tuned merchant embeddings

---

## 🤝 Contributing

PRs welcome — open an issue or drop a suggestion.

---

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.

**You may:**
- ✅ Use for personal and educational purposes
- ✅ Modify and adapt the code
- ✅ Share and redistribute

**You may NOT:**
- ❌ Use for commercial purposes

See the [LICENSE](LICENSE) file for full details.

---

## 👤 Author

**Atishay Jain**

---