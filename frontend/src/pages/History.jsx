import React, { useState } from "react";
import { useHistoryStore } from "../state/HistoryStore";
import HistoryCard from "../components/HistoryCard";

export default function History() {
  const history = useHistoryStore((s) => s.history);
  const removeFromHistory = useHistoryStore((s) => s.removeFromHistory);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (timestamp) => {
    removeFromHistory(timestamp);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Prediction History</h1>

        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-full hover:opacity-90 transition"
          disabled={!history?.length}
        >
          Clear All
        </button>
      </div>

      {!history || history.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <div className="text-2xl">🕊 No predictions yet</div>
          <div className="mt-3">Your past predictions will appear here.</div>
        </div>
      ) : (
        <div>
          {history.map((h) => (
            <div key={h.timestamp} className="animate-fade-in">
              <HistoryCard item={h} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowConfirm(false)}
          />

          <div className="bg-gray-900 rounded-xl p-6 z-50 w-[400px]">
            <h3 className="text-lg font-semibold text-white">Clear all history?</h3>
            <p className="text-sm text-gray-300 mt-2">This action cannot be undone.</p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-full bg-white/5"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-full bg-red-600 text-white"
                onClick={() => {
                  clearHistory();
                  setShowConfirm(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}