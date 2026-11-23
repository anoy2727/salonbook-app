"use client";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { fmtApptDate, fmtDate, money } from "@/lib/utils";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";

export default function Transactions() {
  const { data, loading, error, reload } = useAsync(() => api("/api/admin/transactions"), []);
  return (
    <div>
      <h1 className="text-2xl">Transactions</h1>
      <p className="mt-1 text-stone-600">Payment records are created automatically by verified Stripe events and cannot be edited.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading transactions..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : !data.length ? <EmptyState title="No transactions yet" text="Paid appointments will appear here." /> : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-sand-200 bg-sand-50"><tr>{["Customer", "Service", "Appointment", "Amount", "Currency", "Stripe session", "Status", "Date"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-sand-100">
                {data.map((t) => (
                  <tr key={t._id}>
                    <td className="td"><p className="font-medium">{t.customer?.name || "-"}</p><p className="text-xs text-stone-500">{t.customer?.email}</p></td>
                    <td className="td">{t.service?.serviceName || "-"}</td>
                    <td className="td whitespace-nowrap">{t.appointment ? `${fmtApptDate(t.appointment.appointmentDate)}, ${t.appointment.timeSlot}` : "-"}</td>
                    <td className="td">{money(t.amount, t.currency)}</td>
                    <td className="td uppercase">{t.currency}</td>
                    <td className="td font-mono text-xs" title={t.stripeSessionId}>…{t.stripeSessionId.slice(-12)}</td>
                    <td className="td"><StatusBadge value={t.status} /></td>
                    <td className="td whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
