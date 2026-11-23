"use client";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import StatCard from "@/components/StatCard";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";

export default function AdminOverview() {
  const { data, loading, error, reload } = useAsync(() => api("/api/admin/stats"), []);
  return (
    <div>
      <h1 className="text-2xl">Admin overview</h1>
      <p className="mt-1 text-stone-600">A snapshot of your salon.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading dashboard..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Registered customers" value={data.totalCustomers} />
            <StatCard label="Active services" value={data.activeServices} />
            <StatCard label="Total appointment requests" value={data.totalAppointments} />
            <StatCard label="Pending appointments" value={data.pending} />
            <StatCard label="Confirmed appointments" value={data.confirmed} />
            <StatCard label="Successful payments" value={data.successfulPayments} />
          </div>
        )}
      </div>
    </div>
  );
}
