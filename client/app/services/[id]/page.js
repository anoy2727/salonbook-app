"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { authClient } from "@/lib/auth-client";
import { money, todayISO } from "@/lib/utils";
import RoleGuard from "@/components/RoleGuard";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/StatusBadge";

function BookingForm({ service }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function pickDate(value) {
    setDate(value);
    setSlot("");
    setSlots([]);
    if (!value) return;
    setLoadingSlots(true);
    try { setSlots(await api(`/api/appointments/slots?date=${value}`)); }
    catch (err) { toast.error(err.message); }
    finally { setLoadingSlots(false); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!date) return toast.error("Please choose a date.");
    if (!slot) return toast.error("Please choose a time slot.");
    setSubmitting(true);
    try {
      await api("/api/appointments", { method: "POST", body: { serviceId: service._id, appointmentDate: date, timeSlot: slot, message } });
      toast.success("Appointment request sent! We will confirm it soon.");
      router.push("/dashboard/customer/appointments");
    } catch (err) {
      toast.error(err.message);
      if (err.status === 409) pickDate(date); // refresh slots after a booking conflict
      setSubmitting(false);
    }
  }

  if (!open) return <button className="btn-primary mt-6 w-full sm:w-auto" onClick={() => setOpen(true)}>Book appointment</button>;

  return (
    <form onSubmit={submit} className="card mt-6 space-y-5 p-5">
      <h2 className="text-xl">Request an appointment</h2>
      <div>
        <label className="label" htmlFor="date">Appointment date</label>
        <input id="date" type="date" min={todayISO()} className="input sm:w-56" value={date} onChange={(e) => pickDate(e.target.value)} required />
      </div>
      <div>
        <p className="label">Available time slot</p>
        {!date ? <p className="text-sm text-stone-500">Choose a date to see available slots.</p> : loadingSlots ? <p className="text-sm text-stone-500">Checking availability...</p> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {slots.map(({ slot: s, available }) => (
              <button type="button" key={s} disabled={!available} onClick={() => setSlot(s)}
                className={`rounded-md border px-3 py-2 text-sm ${slot === s ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 bg-white hover:border-brand-500"} disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 disabled:line-through`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="label" htmlFor="message">Additional message (optional)</label>
        <textarea id="message" rows={3} maxLength={500} className="input" placeholder="Anything we should know?" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" disabled={submitting}>{submitting ? "Sending request..." : "Send request"}</button>
        <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

function Details() {
  const { id } = useParams();
  const { data: session } = authClient.useSession();
  const { data: service, loading, error } = useAsync(() => api(`/api/services/${id}`), [id]);
  const isAdmin = session?.user?.role === "admin";

  if (loading) return <Loader full label="Loading service..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl">Service unavailable</h1>
        <p className="mt-2 text-stone-600">{error.message}</p>
        <Link href="/services" className="btn-primary mt-6">Browse services</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/services" className="text-sm text-brand-700 hover:underline">Back to services</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-brand-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.image} alt={service.serviceName} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm text-brand-600">{service.category}</p>
          <h1 className="mt-1 text-3xl">{service.serviceName}</h1>
          {service.status !== "active" && <div className="mt-2"><StatusBadge value="inactive" /></div>}
          <p className="mt-4 whitespace-pre-line text-stone-700">{service.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="card p-4"><dt className="text-xs text-stone-500">Price</dt><dd className="mt-1 font-serif text-2xl">{money(service.price)}</dd></div>
            <div className="card p-4"><dt className="text-xs text-stone-500">Estimated duration</dt><dd className="mt-1 font-serif text-2xl">{service.duration} min</dd></div>
          </dl>
          {isAdmin ? (
            <p className="mt-6 rounded-md bg-sand-100 p-4 text-sm text-stone-600">You are signed in as an admin. Only customers can request appointments.</p>
          ) : service.status !== "active" ? (
            <p className="mt-6 rounded-md bg-sand-100 p-4 text-sm text-stone-600">This service is not available for booking.</p>
          ) : <BookingForm service={service} />}
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailsPage() {
  return <RoleGuard><Details /></RoleGuard>;
}
