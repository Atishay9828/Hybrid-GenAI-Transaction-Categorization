import React from "react";

/**
 * tokens: [{ token: "zomato", score: 0.3 }, ...]
 */
export default function TokenAttributionList({ tokens = [] }) {
  if (!tokens || tokens.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tokens.map((t, i) => {
        const score = Math.max(0, Math.min(1, t.score ?? 0.3));
        const intensity = Math.round(score * 100);
        return (
          <div
            key={i}
            title={`score: ${score.toFixed(2)}`}
            className="text-xs px-2 py-1 rounded-full border border-white/6 backdrop-blur-sm"
            style={{
              background: `linear-gradient(90deg, rgba(255,255,255,${0.02 + score * 0.04}) 0%, rgba(255,255,255,${0.01}) 100%)`,
            }}
          >
            <span className="font-medium mr-1">{t.token}</span>
            <span className="opacity-60">{(score * 100).toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}