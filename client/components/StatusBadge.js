const styles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-stone-100 text-stone-600 border-stone-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  unpaid: "bg-red-50 text-red-700 border-red-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-stone-100 text-stone-600 border-stone-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[value] || styles.cancelled}`}>
      {value}
    </span>
  );
}
