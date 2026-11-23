"use client";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { SALON } from "@/lib/salon";

export default function SalonPage() {
  return (
    <RoleGuard>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl">About {SALON.name}</h1>
        <p className="mt-3 max-w-2xl text-stone-700">We are a friendly neighborhood salon offering hair, skin, nail and spa treatments. Our stylists and therapists focus on listening first, so you leave looking and feeling the way you wanted.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl">Contact</h2>
            <p className="mt-3 text-sm text-stone-700">Phone: {SALON.phone}</p>
            <p className="mt-1 text-sm text-stone-700">Email: {SALON.email}</p>
            <p className="mt-1 text-sm text-stone-700">Address: {SALON.address}</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl">Opening hours</h2>
            {SALON.hours.map(([d, h]) => <p key={d} className="mt-3 text-sm text-stone-700">{d}: {h}</p>)}
          </div>
        </div>
        <Link href="/services" className="btn-primary mt-8">Book a service</Link>
      </div>
    </RoleGuard>
  );
}
