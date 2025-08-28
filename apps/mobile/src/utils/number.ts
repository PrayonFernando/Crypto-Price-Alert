export const fmtMoney = (n?: number, currency = "USD") =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 8,
      }).format(n)
    : "—";

export const fmtPct = (n?: number) =>
  typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(2)}%` : "—";
