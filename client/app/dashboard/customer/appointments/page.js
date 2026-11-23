"use client";
import { useState } from "react";
import Link from "next/link";
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

export default function MyAppointments() {
  const { data, loading, error, reload } = useAsync(() => api("/api/appointments/my"), []);
  const [cancelId, setCancelId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [detail, setDetail] = useState(null);

  async function cancel() {
    setBusy(true);
    try { await api(`/api/appointments/${cancelId}/cancel`, { method: "PATCH" }); toast.success("Appointment request cancelled."); setCancelId(null); reload(); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function pay(id) {
    setPayingId(id);
    try { const { url } = await api("/api/payments/checkout", { method: "POST", body: { appointmentId: id } }); window.location.href = url; }
    catch (e) { toast.error(e.message); setPayingId(null); }
  }

  async function view(id) {
    try { setDetail(await api(`/api/appointments/${id}`)); } catch (e) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-2xl">My appointments</h1>
      <p className="mt-1 text-stone-600">Track your requests, cancel pending ones and pay for confirmed ones.</p>
      <div className="mt-6">
        {loading ? <Loader label="Loading appointments..." /> : error ? <ErrorMessage error={error} onRetry={reload} /> : !data.length ? (
          <EmptyState title="No appointments yet" text="Pick a service and request your first appointment."><Link href="/services" className="btn-primary">Browse services</Link></EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-sand-200 bg-sand-50"><tr>
                {["Service", "Category", "Date", "Time", "Price", "Status", "Payment", "Requested", "Actions"].map((h) => <th key={h} className="th">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-sand-100">
                {data.map((a) => (
                  <tr key={a._id}>
                    <td className="td"><div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {a.service?.image && <img src={a.service.image} alt="" className="h-10 w-10 rounded object-cover" />}
                      <span className="font-medium">{a.service?.serviceName || "Deleted service"}</span></div></td>
                    <td className="td">{a.service?.category || "-"}</td>
                    <td className="td whitespace-nowrap">{fmtApptDate(a.appointmentDate)}</td>
                    <td className="td whitespace-nowrap">{a.timeSlot}</td>
                    <td className="td">{money(a.servicePrice)}</td>
                    <td className="td"><StatusBadge value={a.status} /></td>
                    <td className="td"><StatusBadge value={a.paymentStatus} /></td>
                    <td className="td whitespace-nowrap">{fmtDate(a.createdAt)}</td>
                    <td className="td"><div className="flex gap-2">
                      <button className="btn-outline btn-sm" onClick={() => view(a._id)}>Details</button>
                      {a.status === "pending" && <button className="btn-danger btn-sm" onClick={() => setCancelId(a._id)}>Cancel</button>}
                      {a.status === "confirmed" && a.paymentStatus === "unpaid" && <button className="btn-primary btn-sm" disabled={payingId === a._id} onClick={() => pay(a._id)}>{payingId === a._id ? "Redirecting..." : "Pay Now"}</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!cancelId} danger title="Cancel this request?" message="This pending appointment request will be cancelled. You can book again later." confirmText="Cancel request" loading={busy} onConfirm={cancel} onCancel={() => setCancelId(null)} />
      <Modal open={!!detail} title="Appointment details" onClose={() => setDetail(null)}>
        {detail && <>
          <Row label="Service">{detail.service?.serviceName || "Deleted service"}</Row>
          <Row label="Category">{detail.service?.category}</Row>
          <Row label="Date">{fmtApptDate(detail.appointmentDate)}</Row>
          <Row label="Time">{detail.timeSlot}</Row>
          <Row label="Price">{money(detail.servicePrice)}</Row>
          <Row label="Status"><StatusBadge value={detail.status} /></Row>
          <Row label="Payment"><StatusBadge value={detail.paymentStatus} /></Row>
          <Row label="Your message">{detail.message}</Row>
          <Row label="Requested on">{fmtDate(detail.createdAt)}</Row>
          {detail.transaction && <Row label="Paid on">{fmtDate(detail.transaction.createdAt)}</Row>}
        </>}
      </Modal>
    </div>
  );
}
