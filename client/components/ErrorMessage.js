export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="card border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm text-red-700">{error?.message || "Failed to load data."}</p>
      {onRetry && <button onClick={onRetry} className="btn-outline btn-sm mt-3">Try again</button>}
    </div>
  );
}
