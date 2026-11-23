"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { CATEGORIES } from "@/lib/utils";
import ServiceCard from "@/components/ServiceCard";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";

function Browse() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") || "";
  const sort = params.get("sort") || "";
  const [text, setText] = useState(params.get("search") || "");
  const [search, setSearch] = useState(text);

  useEffect(() => { const t = setTimeout(() => setSearch(text.trim()), 350); return () => clearTimeout(t); }, [text]);

  const update = (key, value) => {
    const p = new URLSearchParams(params.toString());
    value ? p.set(key, value) : p.delete(key);
    router.replace(`/services?${p.toString()}`);
  };

  const { data, loading, error, reload } = useAsync(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (category) q.set("category", category);
    if (sort) q.set("sort", sort);
    return api(`/api/services?${q.toString()}`, { auth: false });
  }, [search, category, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Browse services</h1>
      <p className="mt-1 text-stone-600">Search, filter and sort our full treatment menu.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px_200px]">
        <input className="input" placeholder="Search services by name" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search services" />
        <select className="input" value={category} onChange={(e) => update("category", e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => update("sort", e.target.value)} aria-label="Sort by price">
          <option value="">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="mt-8">
        {loading ? <Loader label="Loading services..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((s) => <ServiceCard key={s._id} service={s} />)}</div>
        ) : (
          <EmptyState title="No services found" text="Try a different search or clear the filters.">
            <button className="btn-outline" onClick={() => { setText(""); router.replace("/services"); }}>Clear filters</button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return <Suspense fallback={<Loader full />}><Browse /></Suspense>;
}
