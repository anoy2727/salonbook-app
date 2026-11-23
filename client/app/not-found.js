import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-serif text-6xl text-brand-600">404</p>
      <h1 className="mt-4 text-2xl">This page does not exist</h1>
      <p className="mt-2 text-stone-600">The link may be broken or the page may have been moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
