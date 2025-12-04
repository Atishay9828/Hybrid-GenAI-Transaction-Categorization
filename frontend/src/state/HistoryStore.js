// src/state/useHistoryStore.js
import { create } from "zustand";

const STORAGE_KEY = "hybrid_genai_history_v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load history:", e);
    return [];
  }
}

function saveToStorage(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save history:", e);
  }
}

export const useHistoryStore = create((set, get) => {
  const initial = loadFromStorage();
  // debug
  console.log("🔥 Zustand store LOADED");
  console.log("History store loaded!", initial.length);

  return {
    history: initial,

    addToHistory: (item) => {
      set((state) => {
        // add new item to front, ensure timestamp exists
        const withTs = { ...item, timestamp: item.timestamp || Date.now() };
        const newHist = [withTs, ...state.history];

        // NO TRIMMING - save all history
        saveToStorage(newHist);
        return { history: newHist };
      });
    },

    removeFromHistory: (timestamp) => {
      set((state) => {
        const filtered = state.history.filter((h) => h.timestamp !== timestamp);
        saveToStorage(filtered);
        return { history: filtered };
      });
    },

    clearHistory: () => {
      set(() => {
        saveToStorage([]);
        return { history: [] };
      });
    },
  };
});