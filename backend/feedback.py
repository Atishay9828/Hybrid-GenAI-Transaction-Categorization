import json
import os

MERCHANT_FILE = "data/merchant_map.json"

def load_merchants():
    if not os.path.exists(MERCHANT_FILE):
        return {}
    with open(MERCHANT_FILE, "r") as f:
        return json.load(f)

def save_merchants(data):
    with open(MERCHANT_FILE, "w") as f:
        json.dump(data, f, indent=4)

def add_merchant(merchant, category):
    data = load_merchants()
    data[merchant] = category
    save_merchants(data)