import requests
import time
import json

API_URL = "http://127.0.0.1:8000/transaction-insight"


def test_insight():
    test_payload = {
        "transaction": {
            "text": "dominos order 750",
            "timestamp": int(time.time() * 1000),
            "merchant": "dominos",
            "category": "Food & Dining",
            "confidence": 0.98,
            "engine": "merchant_override"
        },
        "recent_history": [
            {
                "text": "swiggy 650",
                "timestamp": int(time.time() * 1000) - 200000,
                "merchant": "swiggy",
                "category": "Food & Dining",
                "confidence": 0.92,
                "engine": "merchant_override"
            },
            {
                "text": "zomato order 799",
                "timestamp": int(time.time() * 1000) - 300000,
                "merchant": "zomato",
                "category": "Food & Dining",
                "confidence": 0.97,
                "engine": "merchant_override"
            }
        ]
    }

    print("\n🔥 Testing AI Insight Endpoint...\n")

    start = time.time()

    try:
        res = requests.post(API_URL, json=test_payload, timeout=100)
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running at:", API_URL)
        return
    except requests.exceptions.Timeout:
        print("❌ Request timed out. LLM too slow?")
        return

    duration = time.time() - start

    print(f"⏱ Response Time: {duration:.2f}s\n")

    if res.status_code != 200:
        print("❌ Error from server:", res.status_code)
        print(res.text)
        return

    json_res = res.json()
    insight = json_res.get("insight")

    if not insight:
        print("⚠️ Insight was empty — LLM might not be generating output.")
    else:
        print("✅ Insight generated successfully:\n")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(insight)
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    if duration > 9:
        print("⚠️ WARNING: Insight generation is slow (>9s).")
    else:
        print("🚀 Speed is good.")


if __name__ == "__main__":
    test_insight()