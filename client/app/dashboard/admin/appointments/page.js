"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { fmtApptDate, fmtDate, money } from "@/lib/utils";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import Modal, { Row } from "@/components/Modal";

export default function ManageAppointments() {
  const { data, loading, error, reload } = useAsync(() => api("/api/admin/appointments"), []);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, action }
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const r = await api(`/api/admin/appointments/${confirm.id}/${confirm.action}`, { method: "PATCH" });
      toast.success(r.message);
      setConfirm(null);
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="text-2xl">Manage appointments</h1>
      <p className="mt-1 text-stone-600">Confirm pending requests or cancel unpaid ones.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading appointments..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : !data.length ? <EmptyState title="No appointment requests yet" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-sand-200 bg-sand-50"><tr>{["Customer", "Service", "Date & time", "Price", "Status", "Payment", "Requested", "Actions"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-sand-100">
                {data.map((a) => (
                  <tr key={a._id}>
                    <td className="td"><p className="font-medium">{a.customer?.name || "-"}</p><p className="text-xs text-stone-500">{a.customer?.email}</p></td>
                    <td className="td">{a.service?.serviceName || "Deleted service"}</td>
                    <td className="td whitespace-nowrap">{fmtApptDate(a.appointmentDate)}<br /><span className="text-xs text-stone-500">{a.timeSlot}</span></td>
                    <td className="td">{money(a.servicePrice)}</td>
                    <td className="td"><StatusBadge value={a.status} /></td>
                    <td className="td"><StatusBadge value={a.paymentStatus} /></td>
                    <td className="td whitespace-nowrap">{fmtDate(a.createdAt)}</td>
                    <td className="td"><div className="flex gap-2">
                      <button className="btn-outline btn-sm" onClick={() => setDetail(a)}>Details</button>
                      {a.status === "pending" && <button className="btn-primary btn-sm" onClick={() => setConfirm({ id: a._id, action: "confirm" })}>Confirm</button>}
                      {["pending", "confirmed"].includes(a.status) && a.paymentStatus === "unpaid" && <button className="btn-danger btn-sm" onClick={() => setConfirm({ id: a._id, action: "cancel" })}>Cancel</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!confirm} danger={confirm?.action === "cancel"} title={confirm?.action === "cancel" ? "Cancel this appointment?" : "Confirm this appointment?"}
        message={confirm?.action === "cancel" ? "The customer will see this appointment as cancelled." : "The customer will be able to pay for this appointment."}
        confirmText={confirm?.action === "cancel" ? "Cancel appointment" : "Confirm appointment"} loading={busy} onConfirm={run} onCancel={() => setConfirm(null)} />
      <Modal open={!!detail} title="Appointment details" onClose={() => setDetail(null)}>
        {detail && <>
          <Row label="Customer">{detail.customer?.name}</Row>
          <Row label="Email">{detail.customer?.email}</Row>
          <Row label="Phone">{detail.customer?.phone}</Row>
          <Row label="Service">{detail.service?.serviceName || "Deleted service"}</Row>
          <Row label="Date">{fmtApptDate(detail.appointmentDate)}</Row>
          <Row label="Time">{detail.timeSlot}</Row>
          <Row label="Price">{money(detail.servicePrice)}</Row>
          <Row label="Status"><StatusBadge value={detail.status} /></Row>
          <Row label="Payment"><StatusBadge value={detail.paymentStatus} /></Row>
          <Row label="Customer message">{detail.message}</Row>
          <Row label="Requested on">{fmtDate(detail.createdAt)}</Row>
        </>}
      </Modal>
    </div>
  );
}
