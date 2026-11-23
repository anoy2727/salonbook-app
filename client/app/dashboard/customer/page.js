"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { authClient } from "@/lib/auth-client";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";

export default function CustomerOverview() {
  const { data: session } = authClient.useSession();
  const { data, loading, error, reload } = useAsync(() => api("/api/appointments/stats"), []);
  return (
    <div>
      <h1 className="text-2xl">Hello, {session?.user?.name}</h1>
      <p className="mt-1 text-stone-600">Here is a summary of your appointment requests.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading dashboard..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total appointment requests" value={data.total} />
            <StatCard label="Pending appointments" value={data.pending} />
            <StatCard label="Confirmed appointments" value={data.confirmed} />
            <StatCard label="Cancelled appointments" value={data.cancelled} />
          </div>
        )}
      </div>
      <Link href="/services" className="btn-primary mt-8">Book a new service</Link>
    </div>
  );
}
