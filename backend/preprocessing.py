import re

MERCHANT_NORMALIZE = {
    r"\bjio[-\s]?mart\b": "jiomart",
    r"\bairindia\b": "air india",
    r"\bpaytm\b": "paytm",
    r"\bmc\s*donalds\b": "mcdonalds",
    r"\bmcd\b": "mcdonalds",
    r"\bdominos\b": "dominos",
    r"\bzomato\b": "zomato",
    r"\bswiggy\b": "swiggy",
    r"\bamazon\b": "amazon",
    r"\bflipkart\b": "flipkart",
    r"\bjiomart\b": "jiomart",
    r"\bdmart\b": "dmart",
    r"\breliance\s+fresh\b": "reliance fresh",
    r"\breliance\s+petrol\b": "reliance petrol",
    r"\bindian\s+oil\b": "indianoil"
}

def normalize_whitespace(t): return re.sub(r"\s+", " ", t).strip()

def preprocess(text: str) -> str:
    if text is None:
        return ""

    t = text.lower()
    t = re.sub(r"[^\w\s\-&]", " ", t)
    t = normalize_whitespace(t)

    for pattern, canon in MERCHANT_NORMALIZE.items():
        t = re.sub(pattern, canon, t)

    t = normalize_whitespace(t)
    return t