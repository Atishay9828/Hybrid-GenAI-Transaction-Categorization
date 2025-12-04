from llama_cpp import Llama

# Mock system prompt similar to the real one (approx 400 tokens)
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
""" * 2 # Duplicate to ensure it's long enough to fill context

def reproduce():
    print("Loading model with n_ctx=512...")
    llm = Llama(
        model_path="models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf",
        n_ctx=512,
        n_threads=4,
        verbose=True
    )
    
    text = "UBER TRIP 12345"
    prompt = SYSTEM_PROMPT + f'\n\nTransaction:\n{text}\n'
    
    print(f"Prompt length: {len(prompt)} chars")
    
    print("Generating...")
    try:
        resp = llm(
            prompt=prompt,
            max_tokens=80,
            stop=["}"]
        )
        print("Success!")
    except Exception as e:
        print(f"Crashed as expected: {e}")

if __name__ == "__main__":
    reproduce()
