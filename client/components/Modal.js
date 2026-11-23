"use client";

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl">{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none text-stone-400 hover:text-stone-700" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-sand-100 py-2 text-sm last:border-0">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-medium">{children || "-"}</span>
    </div>
  );
}
