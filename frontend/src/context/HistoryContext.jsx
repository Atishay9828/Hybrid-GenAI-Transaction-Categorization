import { createContext, useContext, useEffect, useState } from "react";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("transaction_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save to localStorage anytime history changes
  useEffect(() => {
    localStorage.setItem("transaction_history", JSON.stringify(history));
  }, [history]);

  // Add new entry
  const addToHistory = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryStore() {
  return useContext(HistoryContext);
}