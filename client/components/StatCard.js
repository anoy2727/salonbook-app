export default function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl text-stone-900">{value ?? "-"}</p>
    </div>
  );
}
