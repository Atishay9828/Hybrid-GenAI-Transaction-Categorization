import json
from llama_cpp import Llama

# Load Qwen2.5 ONCE at backend startup
print("Loading Qwen2.5 LLM fallback…")

LLM = Llama(
    model_path="models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf",
    n_ctx=512,
    n_threads=10,
    n_batch=256,
    temperature=0.0,
    verbose=True
)

ALLOWED = [
    "food","groceries","travel","fuel","bills",
    "shopping","health","entertainment","education","others"
]
SYSTEM_PROMPT = """
You are a highly reliable financial transaction classifier.

STRICT RULES:
- Output ONLY a JSON object.
- Do NOT add any text before or after the JSON.
- NO markdown, NO code fences, NO assistant/human labels.
- If the JSON is invalid, the system fails — so follow the structure EXACTLY.
- If unsure, choose the closest category (not random).
- Keep explanations short (1–2 lines max).

CATEGORIES (choose exactly one):
food, groceries, travel, fuel, bills, shopping, health, entertainment, education, others

STRONG CATEGORY HINTS:
- FOOD: zomato, swiggy, restaurant, cafe, pizza, order, kfc, mcd, burger, biryani, meal
- GROCERIES: mart, fresh, grocery, dmart, jiomart, bigbasket, daily needs, kirana
- TRAVEL: uber, ola, ride, cab, taxi, bus, volvo, flight, airways, airline, ticket, booking
- FUEL: petrol, diesel, gas station, refill, pump, indianoil, bharat petroleum, hpcl
- BILLS: bill, recharge, electricity, water, gas, broadband, postpaid, prepaid
- SHOPPING: amazon, flipkart, myntra, ajio, tatacliq, store, mall, purchase, online order
- HEALTH: pharmacy, apollo, clinic, hospital, medical, diagnostics
- ENTERTAINMENT: movie, pvr, bookmyshow, netflix, hotstar, concert
- EDUCATION: course, tuition, fee, class, coaching, udemy, coursera, byjus
- OTHERS: anything outside the above patterns

OUTPUT FORMAT (exact):
{
  "category": "<one_of_categories>",
  "confidence": <0.0_to_1.0>,
  "explanation": "<short_reason>"
}

You MUST stop after closing the JSON brace.
"""

def llm_reason(text, model_hint, attributions):
    """
    Uses Qwen2.5 to classify when ONNX model confidence is low.
    """

    base_prompt = SYSTEM_PROMPT + f'\n\nTransaction:\n{text}\n'    # Try up to 3 times
    for attempt in range(3):
        resp = LLM(
            prompt=base_prompt,
            max_tokens=80,
            stop=["}"]
        )

        raw = resp["choices"][0]["text"].strip()
        raw = raw + "}" if not raw.endswith("}") else raw

        # Try JSON parsing
        try:
            data = json.loads(raw)

            # sanitize category
            cat = data.get("category", model_hint).lower().strip()
            if cat not in ALLOWED:
                cat = model_hint

            conf = float(data.get("confidence", 0.5))

            return {
                "category": cat,
                "confidence": conf,
                "explanation": data.get("explanation", "LLM fallback used."),
            }

        except:
            continue

    # 🔥 If LLM still fails → safe fallback
    return {
        "category": model_hint,
        "confidence": 0.5,
        "explanation": "LLM fallback failed to parse JSON; using ONNX model hint.",
    }
print("Warming up Qwen2.5 fallback model…")
LLM("hello", max_tokens=1)
print("Warm-up complete.")