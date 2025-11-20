// src/utils/formatTimestamp.js
export default function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const optsTime = { hour: "numeric", minute: "2-digit" };
  const time = d.toLocaleTimeString([], optsTime);

  if (isToday) return `Today · ${time}`;

  const optsDate = { month: "short", day: "numeric" };
  const date = d.toLocaleDateString([], optsDate);

  return `${date} · ${time}`;
}