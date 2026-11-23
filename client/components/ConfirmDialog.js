"use client";

export default function ConfirmDialog({ open, title, message, confirmText = "Confirm", danger, loading, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-sm p-6">
        <h3 className="text-lg">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel} disabled={loading}>Go back</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
