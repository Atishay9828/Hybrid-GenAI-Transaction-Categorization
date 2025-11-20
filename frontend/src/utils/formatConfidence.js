export default function formatConfidence(value) {
  if (!value && value !== 0) return "0%";
  return `${(value * 100).toFixed(1)}%`;
}