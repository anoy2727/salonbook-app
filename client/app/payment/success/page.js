"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import RoleGuard from "@/components/RoleGuard";
import Loader from "@/components/Loader";

function Success() {
  const sessionId = useSearchParams().get("session_id");
  const [result, setResult] = useState({ status: "processing" });

  // The payment is marked "paid" ONLY by the verified Stripe webhook. We just wait for it and read the result.
  useEffect(() => {
    if (!sessionId) return;
    let tries = 0, stop = false;
    async function poll() {
      try {
        const r = await api(`/api/payments/session/${sessionId}`);
        if (stop) return;
        setResult(r);
        if (r.status === "processing" && ++tries < 15) setTimeout(poll, 2000);
        else if (r.status === "processing") setResult({ status: "delayed" });
      } catch { if (!stop) setResult({ status: "delayed" }); }
    }
    poll();
    return () => { stop = true; };
  }, [sessionId]);

  const paid = result.status === "paid";
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {!sessionId ? <><h1 className="text-2xl">No payment found</h1><p className="mt-2 text-stone-600">We could not find a payment session.</p></>
        : result.status === "processing" ? <Loader label="Confirming your payment..." />
        : paid ? <><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div><h1 className="mt-4 text-2xl">Payment successful</h1><p className="mt-2 text-stone-600">Thank you! We received {money(result.amount, result.currency)} for your appointment.</p></>
        : <><h1 className="text-2xl">We are still confirming your payment</h1><p className="mt-2 text-stone-600">This can take a minute. Check My Appointments shortly. If the payment status stays unpaid, contact the salon.</p></>}
      <Link href="/dashboard/customer/appointments" className="btn-primary mt-8">Go to My Appointments</Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return <RoleGuard role="customer"><Suspense fallback={<Loader full />}><Success /></Suspense></RoleGuard>;
}
