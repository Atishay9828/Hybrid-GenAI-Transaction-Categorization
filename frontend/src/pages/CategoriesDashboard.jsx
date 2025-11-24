import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useHistoryStore } from "../state/HistoryStore";
import CategoryPanel from "../components/CategoryPanel";
import { useHaptics } from "../hooks/useHaptics";
const { tap } = useHaptics();

<div
  onClick={() => {
    tap();       // 🔥 micro feedback
    onOpenPanel();
  }}
  className="active:scale-[0.97] transition-all"
></div>
// SAME COLOR MAP
const normalizeCategory = (cat = "") => {
  const c = cat.toLowerCase().trim();

  if (["food", "food & dining", "dining"].includes(c)) return "Food & Dining";
  if (["grocery", "groceries"].includes(c)) return "Groceries";
  if (["travel"].includes(c)) return "Travel";
  if (["fuel", "petrol"].includes(c)) return "Fuel";
  if (["bills", "utilities"].includes(c)) return "Bills";
  if (["shopping"].includes(c)) return "Shopping";
  if (["education"].includes(c)) return "Education";
  if (["health", "medical"].includes(c)) return "Health";

  return "Others";
};
const CATEGORY_COLORS = {
  "Food & Dining": "#FF6F6F",
  Groceries: "#4ADE80",
  Education: "#60A5FA",
  Fuel: "#FACC15",
  Travel: "#818CF8",
  Bills: "#F87171",
  Shopping: "#F472B6",
  Health: "#FB7185",
  Others: "#9CA3AF",
};

// INR Format
const formatINR = (n) => new Intl.NumberFormat("en-IN").format(n || 0);

// Custom Tooltip (kept your styling)
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];

  return (
    <div
      className="p-3 rounded-xl border backdrop-blur-md shadow-lg"
      style={{
        background: "rgba(10,10,10,0.65)",
        borderColor: p.fill + "55",
        boxShadow: `0 4px 20px ${p.fill}55`,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: p.fill }}>
        {p.name}
      </p>
      <p className="text-base text-white">₹{formatINR(p.value)}</p>
    </div>
  );
};

export default function CategoriesDashboard() {
  const history = useHistoryStore((s) => s.history);

  // PANEL STATE
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCategory, setPanelCategory] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [panelColor, setPanelColor] = useState("#999");

  // GROUP BY CATEGORY
  const categoryTotals = useMemo(() => {
    const map = {};
    history.forEach((h) => {
    const cat = normalizeCategory(h.category || "Others");
    const amount = parseFloat(h.text.match(/\d+/)?.[0] || 0);
    map[cat] = (map[cat] || 0) + amount;
    });
    return map;
  }, [history]);

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
    fill: CATEGORY_COLORS[normalizeCategory(cat)],
}));

  const totalSpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // -------------------------
  //  CLICK → OPEN PANEL
  // -------------------------
  function openCategoryPanel(cat) {
    const transactions = history.filter(
      (h) => normalizeCategory(h.category) === normalizeCategory(cat)
    );
    const amounts = transactions.map((t) =>
      parseFloat(t.text.match(/\d+/)?.[0] || 0)
    );

    const merchants = [
      ...new Set(transactions.map((t) => t.merchant || "Unknown")),
    ];

    const panel = {
      total: formatINR(categoryTotals[cat]),
      avg: formatINR(
        amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0
      ),
      highest: formatINR(Math.max(...amounts)),
      lowest: formatINR(Math.min(...amounts)),
      merchants,
      transactions,
    };

    setPanelCategory(cat);
    setPanelData(panel);
    setPanelColor(CATEGORY_COLORS[cat] || "#999");
    setPanelOpen(true);
  }

  return (
    <div className="w-full px-8 py-10 flex flex-col gap-10">
      <h1 className="text-4xl font-bold">Categories Dashboard</h1>
      <p className="text-neutral-400 mb-4">
        Overview of your spending by category and trends.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT CARD: Total Spend */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
          <p className="text-neutral-400">Total spend</p>
          <p className="text-3xl font-bold mt-2">₹{formatINR(totalSpend)}</p>
          <p className="text-neutral-500 mt-1">
            {history.length} transactions analyzed
          </p>
        </div>

        {/* DONUT */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md flex justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TOP CATEGORIES */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4">Top Categories</h2>

          <div className="flex flex-col gap-3">
            {pieData
              .sort((a, b) => b.value - a.value)
              .map((c, i) => (
                <div
                  key={i}
                  onClick={() => openCategoryPanel(c.name)}
                  className="flex justify-between border-b border-white/5 pb-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: c.fill }}
                    ></span>
                    {c.name}
                  </span>

                  <span>₹{formatINR(c.value)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* PANEL */}
      <CategoryPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        category={panelCategory}
        color={panelColor}
        data={panelData || {}}
      />
    </div>
  );
}