export default function Loader({ full = false, label = "Loading..." }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? "min-h-[60vh]" : "py-16"}`} role="status">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <span className="text-sm text-stone-500">{label}</span>
    </div>
  );
}
