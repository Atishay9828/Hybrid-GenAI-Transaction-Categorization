import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

/**
 * HistoryPanel
 * - Fetches AI insight for the passed `data` transaction.
 * - Aborts request on close/data change.
 * - Handles non-JSON and non-200 responses gracefully.
 */
export default function HistoryPanel({ data, onClose }) {
  const history = useHistoryStore((s) => s.history);

  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState(null);

  // keep a ref for AbortController so we can cancel fetches
  const abortRef = useRef(null);

  // Freeze background scroll while panel open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  // cleanup on unmount / close: abort outstanding requests
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  if (!data) return null;

  const amount = data.text.match(/\d+/)?.[0] || 0;

  const buildRecentHistory = () => {
    const sameCat = history.filter(
      (h) =>
        (h.category || "").toLowerCase() === (data.category || "").toLowerCase()
    );

    return sameCat.slice(0, 3).map((h) => ({
      text: h.text,
      timestamp: h.timestamp,
      merchant: h.merchant,
      category: h.category,
      confidence: h.confidence,
      engine: h.engine,
    }));
  };

  // Helper: create a stable cache key
  const cacheKey = `insight_${data.timestamp}_${(data.category || "unknown")
    .toString()
    .replace(/\s+/g, "_")
    .toLowerCase()}`;

  // Main effect: fetch insight when data changes
  useEffect(() => {
    let isMounted = true;
    setInsight(null);
    setInsightError(null);
    setLoadingInsight(true);

    // return cached instantly if available
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setInsight(cached);
      setLoadingInsight(false);
      return;
    }

    // Abort controller + timeout
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutMs = 30000; // 30s

    const timeoutId = setTimeout(() => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    }, timeoutMs);

    (async () => {
      try {
        const payload = {
          transaction: {
            text: data.text,
            timestamp: data.timestamp,
            merchant: data.merchant,
            category: data.category,
            confidence: data.confidence,
            engine: data.engine,
          },
          recent_history: buildRecentHistory(),
        };

        // If your frontend port is 5173 and backend 8000, request must go to backend port.
        // Use full origin (http://127.0.0.1:8000/transaction-insight). If you proxy dev server, adjust accordingly.
        const res = await fetch("http://127.0.0.1:8000/transaction-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        // If aborted, throw to be caught below
        if (controller.signal.aborted) throw new Error("Request aborted");

        // Non-OK responses
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          const msg = `Server returned ${res.status}${txt ? `: ${txt}` : ""}`;
          throw new Error(msg);
        }

        // Try JSON parse, fallback to plain text
        let json;
        try {
          json = await res.json();
        } catch (e) {
          // res had non-JSON body — attempt to read as text and use it
          const txt = await res.text().catch(() => "");
          if (txt && txt.trim().length) {
            // set as insight directly
            if (isMounted) {
              setInsight(txt.trim());
              sessionStorage.setItem(cacheKey, txt.trim());
            }
            return;
          }
          throw new Error("Server returned invalid JSON");
        }

        // Expecting { insight: "..." }
        if (!json || typeof json !== "object" || !("insight" in json)) {
          throw new Error("Unexpected server response format");
        }

        const got = (json.insight || "").toString().trim();
        if (!got) {
          throw new Error("Empty insight returned");
        }

        if (isMounted) {
          setInsight(got);
          sessionStorage.setItem(cacheKey, got);
        }
      } catch (err) {
        // Distinguish abort vs other errors
        if (err.name === "AbortError") {
          console.warn("Insight fetch aborted");
          // keep loading false
          if (isMounted) setInsightError("Insight request aborted.");
        } else {
          console.error("Insight fetch error:", err);
          if (isMounted)
            setInsightError(
              typeof err === "string" ? err : err.message || "Failed to fetch insight"
            );
        }
      } finally {
        clearTimeout(timeoutId);
        abortRef.current = null;
        if (isMounted) setLoadingInsight(false);
      }
    })();

    return () => {
      isMounted = false;
      if (abortRef.current) abortRef.current.abort();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.timestamp]); // only re-run when transaction changes

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
        onClick={() => {
          // abort any outstanding fetch
          if (abortRef.current) abortRef.current.abort();
          onClose();
        }}
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
            <div>
              <p className="text-red-400">{insightError}</p>
              <p className="mt-2 text-xs text-neutral-400">
                Check backend logs and network. Open devtools → Network to inspect the
                POST /transaction-insight request.
              </p>
            </div>
          ) : insight ? (
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{insight}</p>
          ) : (
            <p className="text-neutral-400">No insight available.</p>
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