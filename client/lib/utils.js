export const CATEGORIES = [
  "Haircut & Styling", "Hair Coloring", "Hair Treatment", "Facial & Skincare",
  "Makeup", "Manicure & Pedicure", "Spa & Massage",
];

export const money = (n, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(Number(n) || 0);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-";

// Appointment dates are stored as YYYY-MM-DD
export const fmtApptDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "-";

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
