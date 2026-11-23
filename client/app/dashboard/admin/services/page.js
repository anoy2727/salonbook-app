"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { money } from "@/lib/utils";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ManageServices() {
  const { data, loading, error, reload } = useAsync(() => api("/api/admin/services"), []);
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function toggle(s) {
    const status = s.status === "active" ? "inactive" : "active";
    try { await api(`/api/admin/services/${s._id}/status`, { method: "PATCH", body: { status } }); toast.success(`Service ${status === "active" ? "activated" : "deactivated"}.`); reload(); }
    catch (e) { toast.error(e.message); }
  }
  async function remove() {
    setBusy(true);
    try { await api(`/api/admin/services/${deleteId}`, { method: "DELETE" }); toast.success("Service deleted."); setDeleteId(null); reload(); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl">Manage services</h1><p className="mt-1 text-stone-600">Only active services appear on the public site.</p></div>
        <Link href="/dashboard/admin/services/new" className="btn-primary">Add service</Link>
      </div>
      <div className="mt-6">
        {loading ? <Loader label="Loading services..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : !data.length ? (
          <EmptyState title="No services yet" text="Add your first salon service."><Link href="/dashboard/admin/services/new" className="btn-primary">Add service</Link></EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-sand-200 bg-sand-50"><tr>{["Service", "Category", "Price", "Duration", "Status", "Actions"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-sand-100">
                {data.map((s) => (
                  <tr key={s._id}>
                    <td className="td"><div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt="" className="h-10 w-10 rounded object-cover" /><span className="font-medium">{s.serviceName}</span></div></td>
                    <td className="td">{s.category}</td>
                    <td className="td">{money(s.price)}</td>
                    <td className="td">{s.duration} min</td>
                    <td className="td"><StatusBadge value={s.status} /></td>
                    <td className="td"><div className="flex gap-2">
                      <Link href={`/dashboard/admin/services/${s._id}`} className="btn-outline btn-sm">Edit</Link>
                      <button className="btn-outline btn-sm" onClick={() => toggle(s)}>{s.status === "active" ? "Deactivate" : "Activate"}</button>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteId(s._id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} danger title="Delete this service?" message="This cannot be undone. Existing appointments will keep their price but lose the service details." confirmText="Delete service" loading={busy} onConfirm={remove} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
