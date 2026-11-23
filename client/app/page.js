"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import ServiceCard from "@/components/ServiceCard";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES } from "@/lib/utils";

const BANNER = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=70";

const steps = [
  ["Choose a service", "Browse haircuts, color, skincare, nails and spa treatments."],
  ["Request a time", "Pick a date and time slot that suits you."],
  ["Get confirmation", "The salon confirms your request, usually within a few hours."],
  ["Pay securely", "Pay online with Stripe, then just show up and relax."],
];

export default function Home() {
  const featured = useAsync(() => api("/api/services?limit=6", { auth: false }), []);
  const categories = useAsync(() => api("/api/services/categories", { auth: false }), []);

  return (
    <>
      <section className="relative bg-brand-900 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(74,26,35,.92), rgba(74,26,35,.55)), url(${BANNER})` }}>
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <h1 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl">Look forward to your next salon visit</h1>
          <p className="mt-5 max-w-xl text-lg text-brand-100">Browse our treatments, request a time that works for you, and pay online once your appointment is confirmed.</p>
          <Link href="/services" className="btn mt-8 bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">Explore Salon Services</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Featured services</h2>
            <p className="mt-1 text-stone-600">A few favorites from our menu.</p>
          </div>
          <Link href="/services" className="text-sm font-medium text-brand-700 hover:underline">See all services</Link>
        </div>
        <div className="mt-8">
          {featured.loading ? <Loader label="Loading services..." /> : featured.error ? <ErrorMessage error={featured.error} onRetry={featured.reload} /> : featured.data?.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.data.map((s) => <ServiceCard key={s._id} service={s} />)}</div>
          ) : <EmptyState title="No services yet" text="Please check back soon." />}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-3xl">Explore by category</h2>
        <p className="mt-1 text-stone-600">Find exactly what you are looking for.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(categories.data || CATEGORIES.map((name) => ({ name }))).map((c) => (
            <Link key={c.name} href={`/services?category=${encodeURIComponent(c.name)}`} className="card p-5 transition-colors hover:border-brand-500">
              <h3 className="text-lg">{c.name}</h3>
              {c.count !== undefined && <p className="mt-1 text-sm text-stone-500">{c.count} {c.count === 1 ? "service" : "services"}</p>}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-lg bg-sand-100 px-6 py-12 sm:px-12">
          <h2 className="text-3xl">How booking works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-3 text-lg">{t}</h3>
                <p className="mt-1 text-sm text-stone-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
