import React, { useState } from "react";
import PredictionCard from "../components/PredictionCard";
import useTheme from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";
import TransactionInput from "../components/TransactionInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { useHistoryStore } from "../state/HistoryStore";
import { useMerchantMemoryStore } from "../state/MerchantMemory";
import { extractMerchantFromText } from "../utils/extractMerchant";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const addToHistory = useHistoryStore((s) => s.addToHistory);
  const addMerchant = useMerchantMemoryStore((s) => s.addMerchant);

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      // 🔥 Extract merchant from text
      const merchant = extractMerchantFromText(text);

      // 🔥 Extract amount
      const amtMatch = text.match(/\d+/);
      const amount = amtMatch ? parseFloat(amtMatch[0]) : 0;

      // ⭐ Save to merchant memory
      addMerchant({
        name: merchant,
        category: data.category,
        total: amount,
      });

      // ⭐ Save to history
      addToHistory({
        text,
        merchant,
        category: data.category,
        confidence: data.confidence,
        engine: data.used,
        timestamp: Date.now(),
      });

      // Update UI result
      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);

      setResult({
        category: "others",
        confidence: 0,
        explanation: "Prediction failed",
        engine: "unknown",
        token_attributions: [],
      });
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center mt-10 px-4">
      <ThemeToggle />

      <TransactionInput text={text} setText={setText} onPredict={handlePredict} />

      <div className="mt-16 w-full max-w-xl flex flex-col gap-4 justify-center items-center">
        {loading && <LoadingSpinner />}

        {result && (
          <PredictionCard
            category={result.category}
            confidence={result.confidence}
            explanation={result.explanation}
            engine={result.used}
            token_attributions={result.token_attributions}
          />
        )}
      </div>
    </div>
  );
}
