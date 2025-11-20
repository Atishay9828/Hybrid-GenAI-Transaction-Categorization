import React from "react";
import categoryColors from "../utils/categoryColors";
import engineLabels from "../utils/engineLabels";
import formatConfidence from "../utils/formatConfidence";
import TokenAttributionList from "./TokenAttributionList";
import { CheckCircle2 } from "lucide-react";
const categoryLabels = {
  "food & dining": "Food & Dining",
  "food": "Food & Dining",
  "dining": "Food & Dining",
  "shopping": "Shopping",
  "entertainment": "Entertainment",
  "utilities": "Utilities",
  "health": "Health",
  "travel": "Travel",
  "others": "Others",
  "groceries": "Groceries",
  "fuel": "Fuel",
  "bills": "Bills",
  "education": "Education",
  "bills & utilities": "Bills & Utilities",
};

export default function PredictionCard({
  category = "others",
  confidence = 0,
  explanation = "",
  engine = "unknown",
  token_attributions = [],
}) {
  // Normalize and safe-lookup
  const cat = (category || "others").toLowerCase();
  const colors = categoryColors[cat] || categoryColors["others"];
  const engineMeta = engineLabels[engine] || engineLabels["unknown"];
  const confPct = Math.max(0, Math.min(1, Number(confidence)));

  return (
    <div
      className="w-full max-w-xl mx-auto rounded-2xl p-6 shadow-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(10,11,12,0.6), rgba(3,4,6,0.5))",
        border: "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.ring} ring-1`}
          >
            <CheckCircle2 className={`${colors.text} w-5 h-5`} />
            <div className={`font-semibold ${colors.text} text-sm`}>
            {categoryLabels[cat] || "Others"}
          </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <div className="text-sm font-medium">{formatConfidence(confPct)}</div>
            <div className="mt-1 text-[12px] opacity-70 max-w-sm">{explanation}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-[11px] px-2 py-1 rounded-full ${engineMeta.tone} border border-white/3`}>
            {engineMeta.label}
          </div>
        </div>
      </div>

      {/* confidence bar */}
      <div className="mt-4">
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${confPct * 100}%`,
              background: `linear-gradient(90deg, rgba(255,215,0,0.95), rgba(255,110,180,0.9))`,
              boxShadow: "0 6px 24px rgba(255,110,180,0.06)",
            }}
          />
        </div>
      </div>

      {/* tokens */}
      <div className="mt-4">
        <TokenAttributionList tokens={token_attributions} />
      </div>
    </div>
  );
}