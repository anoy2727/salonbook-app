"use client";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";

export default function PaymentCancelPage() {
  return (
    <RoleGuard role="customer">
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-700">×</div>
        <h1 className="mt-4 text-2xl">Payment cancelled</h1>
        <p className="mt-2 text-stone-600">No money was taken. You can pay again any time from My Appointments.</p>
        <Link href="/dashboard/customer/appointments" className="btn-primary mt-8">Back to My Appointments</Link>
      </div>
    </RoleGuard>
  );
}
