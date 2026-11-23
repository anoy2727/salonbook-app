"use client";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl">Something went wrong</h1>
      <p className="mt-2 text-stone-600">{error?.message || "An unexpected error happened."}</p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
