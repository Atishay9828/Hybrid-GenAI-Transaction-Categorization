// src/components/HistoryCard.jsx
import React from "react";
import formatConfidence from "../utils/formatConfidence";
import formatTimestamp from "../utils/formatTimestamp";
import categoryColors from "../utils/categoryColors";
import engineLabels from "../utils/engineLabels";
import { Trash2 } from "lucide-react";

export default function HistoryCard({ item, onDelete }) {
  const {
    text = "",
    category = "others",
    confidence = 0,
    used = "unknown",
    engine = used, // older entries might use `used`
    token_attributions = [],
    timestamp,
  } = item;

  const cat = (category || "others").toLowerCase();
  const colors = categoryColors[cat] || categoryColors.others;
  const engineMeta = engineLabels[engine] || engineLabels.unknown;
  const confPct = Math.max(0, Math.min(1, Number(confidence)));

  return (
    <div className="w-full bg-gradient-to-b from-white/3 to-black/5 rounded-2xl p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.ring} ring-1`}>
            <span className={`text-xs font-semibold ${colors.text}`}>{cat.toUpperCase()}</span>
          </div>

          <div>
            <div className="text-sm font-medium">{formatConfidence(confPct)}</div>
            <div className="text-[13px] text-gray-300/80 mt-1 max-w-lg whitespace-nowrap overflow-hidden text-ellipsis">
              {text}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-[11px] px-2 py-1 rounded-full ${engineMeta.tone} border border-white/6`}>
            {engineMeta.label}
          </div>

          <button
            onClick={() => onDelete && onDelete(timestamp)}
            className="p-2 rounded-full hover:bg-white/5 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-gray-300" />
          </button>
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
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
        <div>
          {token_attributions?.slice(0, 4).map((t, i) => (
            <span key={i} className="inline-block mr-2 px-2 py-1 rounded-full bg-black/20 text-xs">
              {t.token}
            </span>
          ))}
        </div>
        <div>{formatTimestamp(timestamp)}</div>
      </div>
    </div>
  );
}