export default function EmptyState({ title, text, children }) {
  return (
    <div className="card px-6 py-12 text-center">
      <h3 className="text-lg">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
