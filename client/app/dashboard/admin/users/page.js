"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { fmtDate } from "@/lib/utils";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import Modal, { Row } from "@/components/Modal";
import { Avatar } from "@/components/Navbar";

export default function ManageUsers() {
  const { data, loading, error, reload } = useAsync(() => api("/api/admin/users"), []);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null); // { user, action }
  const [busy, setBusy] = useState(false);

  async function view(id) {
    try { setDetail(await api(`/api/admin/users/${id}`)); } catch (e) { toast.error(e.message); }
  }
  async function run() {
    setBusy(true);
    try {
      const r = await api(`/api/admin/users/${confirm.user._id}/${confirm.action}`, { method: "PATCH" });
      toast.success(r.message); setConfirm(null); reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl">Manage users</h1>
      <p className="mt-1 text-stone-600">Blocked customers cannot use protected features.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading users..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : !data.length ? <EmptyState title="No customers yet" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-sand-200 bg-sand-50"><tr>{["Customer", "Email", "Joined", "Status", "Actions"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-sand-100">
                {data.map((u) => (
                  <tr key={u._id}>
                    <td className="td"><div className="flex items-center gap-3"><Avatar user={u} /><span className="font-medium">{u.name}</span></div></td>
                    <td className="td">{u.email}</td>
                    <td className="td whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="td"><StatusBadge value={u.isBlocked ? "blocked" : "active"} /></td>
                    <td className="td"><div className="flex gap-2">
                      <button className="btn-outline btn-sm" onClick={() => view(u._id)}>Details</button>
                      {u.isBlocked ? <button className="btn-primary btn-sm" onClick={() => setConfirm({ user: u, action: "unblock" })}>Unblock</button>
                        : <button className="btn-danger btn-sm" onClick={() => setConfirm({ user: u, action: "block" })}>Block</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!confirm} danger={confirm?.action === "block"} title={confirm?.action === "block" ? "Block this user?" : "Unblock this user?"}
        message={confirm ? (confirm.action === "block" ? `${confirm.user.name} will lose access to protected features.` : `${confirm.user.name} will be able to use the platform again.`) : ""}
        confirmText={confirm?.action === "block" ? "Block user" : "Unblock user"} loading={busy} onConfirm={run} onCancel={() => setConfirm(null)} />
      <Modal open={!!detail} title="User details" onClose={() => setDetail(null)}>
        {detail && <>
          <Row label="Name">{detail.name}</Row>
          <Row label="Email">{detail.email}</Row>
          <Row label="Phone">{detail.phone}</Row>
          <Row label="Joined">{fmtDate(detail.createdAt)}</Row>
          <Row label="Appointments">{String(detail.appointments)}</Row>
          <Row label="Account"><StatusBadge value={detail.isBlocked ? "blocked" : "active"} /></Row>
        </>}
      </Modal>
    </div>
  );
}
