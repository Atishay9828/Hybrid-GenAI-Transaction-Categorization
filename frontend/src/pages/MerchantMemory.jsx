import React, { useState } from "react";
import { useMerchantMemoryStore } from "../state/MerchantMemory";
import { useHistoryStore } from "../state/HistoryStore";
import categoryColors from "../utils/categoryColors";
import { extractMerchantFromText } from "../utils/extractMerchant";

// Format INR currency
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN").format(num);

// Title-case names
const titleCase = (str) =>
  str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Format timestamps
const formatTimestamp = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Internal normalization (same as store)
const normalize = (txt) =>
  txt
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function MerchantMemory() {
  const { merchants } = useMerchantMemoryStore();
  const history = useHistoryStore((s) => s.history);

  console.log("🔥 Zustand History Store:", history);

  const [open, setOpen] = useState(null);

  const sorted = [...merchants].sort((a, b) => b.total - a.total);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Merchant Memory</h1>
      <p className="text-base opacity-80">
        Your frequently visited merchants and spending patterns.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {sorted.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center opacity-70 backdrop-blur-sm">
            No merchants tracked yet.
          </div>
        ) : (
          sorted.map((m, i) => {
            const cat = m.category?.toLowerCase() || "others";
            const colors = categoryColors[cat] || categoryColors["others"];

            const internal = m.internalName;

            // MATCH HISTORY BY DETECTED MERCHANT, NOT h.merchant
            const visits = history.filter((h) => {
              const detected = extractMerchantFromText(h.text);
              return normalize(detected) === internal;
            });

            const amounts = visits.map((v) =>
              parseFloat(v.text.match(/\d+/)?.[0] || 0)
            );

            const highest = amounts.length ? Math.max(...amounts) : 0;
            const lowest = amounts.length ? Math.min(...amounts) : 0;

            return (
              <div
                key={i}
                onClick={() => setOpen(open === i ? null : i)}
                className={`
                  p-5 rounded-2xl bg-white/5 border shadow-xl 
                  backdrop-blur-md cursor-pointer transition-all 
                  ${colors.ring} hover:ring-2 
                  border-white/10 hover:scale-[1.02]
                  ${open === i ? "ring-2" : "ring-0"}
                `}
              >
                {/* TOP CARD */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">
                      {titleCase(m.displayName)}
                    </h2>

                    <span className={`text-sm mt-1 ${colors.text}`}>
                      {titleCase(m.category)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{formatINR(m.total)}
                    </p>
                    <p className="text-sm opacity-70">{m.visits} visits</p>
                    <p className="text-sm opacity-60">
                      Avg ₹{formatINR(Math.round(m.total / m.visits))} per visit
                    </p>
                  </div>
                </div>

                {/* EXPANDED SECTION */}
                {open === i && (
                  <div className="mt-4 p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 transition-all">
                    <h3 className="font-semibold text-gray-200">
                      Visit History
                    </h3>

                    {visits.map((v, idx) => {
                      const amountMatch = v.text.match(/\d+/);
                      const amount = amountMatch
                        ? parseFloat(amountMatch[0])
                        : 0;

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white/5 p-3 rounded-lg"
                        >
                          <div className="flex flex-col">
                            <p className="text-white/90">
                              ₹{formatINR(amount)}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatTimestamp(v.timestamp)}
                            </p>
                          </div>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} ${colors.ring} ring-1`}
                          >
                            {titleCase(v.category)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Insights */}
                    <div className="pt-3 text-sm text-gray-300">
                      <p>Highest Spend: ₹{formatINR(highest)}</p>
                      <p>Lowest Spend: ₹{formatINR(lowest)}</p>
                      <p>
                        First Visit:{" "}
                        {formatTimestamp(visits[visits.length - 1]?.timestamp)}
                      </p>
                      <p>
                        Last Visit: {formatTimestamp(visits[0]?.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
