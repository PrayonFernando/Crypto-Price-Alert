export const fmtUsd = (n?: number | null) =>
  typeof n === "number"
    ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "-";

export const pctColor = (pct?: number | null) =>
  pct == null ? "#aaa" : pct >= 0 ? "#1DB954" : "#E74C3C";

export const fmtPct = (n?: number | null) =>
  typeof n === "number" ? `${n.toFixed(2)}%` : "-";
