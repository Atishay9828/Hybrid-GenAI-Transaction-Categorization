// utils/dateUtils.js
export function formatMonthYear(d) {
  const dt = new Date(d);
  return dt.toLocaleString("en-IN", { month: "short", year: "numeric" }); // e.g. "Apr 2025"
}

export function getLastNMonths(n = 6) {
  const res = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    res.push({ key, label: formatMonthYear(dt) });
  }
  return res;
}