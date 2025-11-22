import { create } from "zustand";
import { extractMerchantFromText } from "../utils/extractMerchant";

// Internal merchant normalizer (hidden from UI)
function normalizeMerchant(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const useMerchantMemoryStore = create((set) => ({
  merchants: [],

  addMerchant: (merchant) =>
    set((state) => {
      // Normalize for internal grouping
      const internalName = normalizeMerchant(merchant.name);

      // See if this merchant already exists internally
      const existing = state.merchants.find(
        (m) => m.internalName === internalName
      );

      // If exists → update totals & visits
      if (existing) {
        return {
          merchants: state.merchants.map((m) =>
            m.internalName === internalName
              ? {
                ...m,
                visits: m.visits + 1,
                total: m.total + merchant.total,
                // Keep the PRETTIEST version of name
                displayName: merchant.name || m.displayName,
              }
              : m
          ),
        };
      }

      // New merchant → store internalName + displayName separately
      return {
        merchants: [
          ...state.merchants,
          {
            internalName,
            displayName: merchant.name,
            category: merchant.category,
            total: merchant.total,
            visits: 1,
          },
        ],
      };
    }),
}));
