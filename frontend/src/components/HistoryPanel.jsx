import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHistoryStore } from "../state/HistoryStore";

function InsightShimmer() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
      <div className="h-4 bg-white/10 rounded w-4/6"></div>
      <div className="h-4 bg-white/10 rounded w-3/6"></div>
    </div>
  );
}

export default function HistoryPanel({ data, onClose }) {
  const history = useHistoryStore((s) => s.history);

  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState(null);

  // Freeze background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  if (!data) return null;

  const amount = data.text.match(/\d+/)?.[0] || 0;

  // --------------------------
  // Build recent history (same category)
  // --------------------------
  const buildRecentHistory = () => {
    const sameCat = history.filter(
      (h) =>
        (h.category || "").toLowerCase() === (data.category || "").toLowerCase()
    );

    return sameCat.slice(0, 12).map((h) => ({
      text: h.text,
      timestamp: h.timestamp,
      merchant: h.merchant,
      category: h.category,
      confidence: h.confidence,
      engine: h.engine,
    }));
  };

  // --------------------------
  // Fetch AI Insight
  // --------------------------
  useEffect(() => {
    setInsight(null);
    setInsightError(null);
    setLoadingInsight(true);

    const cacheKey = `insight_${data.timestamp}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setInsight(cached);
      setLoadingInsight(false);
      return;
    }

    fetch("http://127.0.0.1:8000/transaction-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction: {
          text: data.text,
          timestamp: data.timestamp,
          merchant: data.merchant,
          category: data.category,
          confidence: data.confidence,
          engine: data.engine,
        },
        recent_history: buildRecentHistory(),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.insight) throw new Error("No insight returned");
        setInsight(json.insight);
        sessionStorage.setItem(cacheKey, json.insight);
      })
      .catch((err) => {
        console.error("Insight error:", err);
        setInsightError("Could not generate insight.");
      })
      .finally(() => setLoadingInsight(false));
  }, [data.timestamp]);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="
        fixed top-0 right-0 h-full
        w-[92%] sm:w-[70%] md:w-[55%] lg:w-[42%]
        bg-[rgba(15,15,15,0.6)]
        backdrop-blur-2xl
        border-l border-white/10
        shadow-[0_0_35px_rgba(0,0,0,0.65)]
        rounded-l-2xl p-8
        overflow-y-auto overscroll-contain
        scroll-smooth touch-pan-y
        z-[50] text-white
      "
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
      >
        ✕
      </button>

      {/* AMOUNT */}
      <h2 className="text-2xl font-bold mb-1">₹{amount}</h2>

      {/* TIME */}
      <p className="text-neutral-400 text-sm mb-6">
        {new Date(data.timestamp).toLocaleString("en-IN")}
      </p>

      {/* DETAILS */}
      <div className="space-y-4 text-lg">
        <p>
          <span className="text-neutral-400">Merchant:</span>{" "}
          <b>{data.merchant || "Unknown"}</b>
        </p>

        <p>
          <span className="text-neutral-400">Category:</span>{" "}
          <b>{data.category}</b>
        </p>

        <p>
          <span className="text-neutral-400">Engine:</span>{" "}
          <b>{data.engine}</b>
        </p>

        <p>
          <span className="text-neutral-400">Confidence:</span>{" "}
          <b>{(data.confidence * 100).toFixed(1)}%</b>
        </p>

        <div className="w-full h-[1px] bg-white/10 my-6"></div>

        {/* AI INSIGHT BOX */}
       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-2">AI Insight</h3>

        {loadingInsight ? (
            <InsightShimmer />
        ) : insightError ? (
            <p className="text-red-400">{insightError}</p>
        ) : (
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {insight}
            </p>
        )}
        </div>

        {/* RAW TEXT */}
        <div className="pt-4">
          <h3 className="font-semibold text-xl mb-2">Raw Text</h3>
          <p className="text-neutral-300 leading-relaxed">{data.text}</p>
        </div>
      </div>
    </motion.div>
  );
}