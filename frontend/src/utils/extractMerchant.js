import merchantMap from "../data/merchant_map.json";

const FILLER_WORDS = [
  "monthly", "payment", "order", "booking", "subscription",
  "recharge", "bill", "upi", "sent", "transfer", "debit",
  "credit", "fee", "fees", "fueling", "purchase"
];

export function extractMerchantFromText(text) {
  const t = text.toLowerCase();

  // 1 — Check for known merchants (fast path)
  for (const merchant in merchantMap) {
    if (t.includes(merchant.toLowerCase())) {
      return merchant;
    }
  }

  // 2 — Clean & split
  const cleaned = t.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(" ");

  // 3 — Remove filler words BEFORE extracting
  const filtered = parts.filter((w) => !FILLER_WORDS.includes(w));

  // 4 — Find the index of the number in original parts
  const numIndex = parts.findIndex((p) => /\d/.test(p));

  if (numIndex === -1) {
    // No number → fallback to first two filtered words
    return filtered.slice(0, 2).join(" ") || "unknown";
  }

  // 5 — Remove the word before number (your rule)
  const merchantWords = parts.slice(0, Math.max(0, numIndex - 1));

  // 6 — Filter out filler words again
  const final = merchantWords.filter((w) => !FILLER_WORDS.includes(w));

  const name = final.join(" ").trim();

  return name || "unknown";
}
