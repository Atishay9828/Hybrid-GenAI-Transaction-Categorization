import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_override():
    print("Checking API health...")
    try:
        res = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Health check: {res.status_code}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return

    # 1. Test normal prediction (should use ONNX or Merchant)
    text = "UBER TRIP"
    print(f"Testing normal prediction for '{text}'...")
    try:
        res = requests.post(f"{BASE_URL}/predict", json={"text": text})
        data = res.json()
        print(f"Result: {data['category']} (Used: {data['used']})")
    except Exception as e:
        print(f"Prediction failed: {e}")
        return
    
    # 2. Test forced LLM prediction
    print(f"\nTesting forced LLM prediction for '{text}'...")
    try:
        res = requests.post(f"{BASE_URL}/predict", json={"text": text, "force_llm": True})
        data = res.json()
        print(f"Result: {data['category']} (Used: {data['used']})")
        
        if data['used'] == 'llm_fallback':
            print("\nSUCCESS: Forced LLM used.")
        else:
            print("\nFAILURE: Forced LLM NOT used.")
    except Exception as e:
        print(f"Forced prediction failed: {e}")

if __name__ == "__main__":
    test_override()
