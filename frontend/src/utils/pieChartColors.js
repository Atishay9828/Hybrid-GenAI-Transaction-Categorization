const pieChartColors = {
  "food": "#ff4d6d",             // cranberry
  "food & dining": "#ff4d6d",

  "groceries": "#4ade80",        // green
  "travel": "#60a5fa",           // blue
  "fuel": "#facc15",             // yellow
  "bills": "#fb923c",            // orange
  "shopping": "#f472b6",         // pink
  "health": "#f87171",           // red
  "entertainment": "#a78bfa",    // purple
  "education": "#818cf8",        // indigo

  "others": "#9ca3af"
};

export function getPieColor(category) {
  if (!category) return "#9ca3af";
  const key = category.toLowerCase().trim();
  return pieChartColors[key] || "#9ca3af";
}