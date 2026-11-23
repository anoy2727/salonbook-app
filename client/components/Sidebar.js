"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const customerLinks = [
  ["/dashboard/customer", "Overview"],
  ["/dashboard/customer/appointments", "My Appointments"],
  ["/dashboard/customer/profile", "My Profile"],
];
const adminLinks = [
  ["/dashboard/admin", "Overview"],
  ["/dashboard/admin/services", "Manage Services"],
  ["/dashboard/admin/services/new", "Add Service"],
  ["/dashboard/admin/appointments", "Manage Appointments"],
  ["/dashboard/admin/users", "Manage Users"],
  ["/dashboard/admin/transactions", "Transactions"],
  ["/dashboard/admin/profile", "My Profile"],
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = role === "admin" ? adminLinks : customerLinks;
  const isActive = (href) => (href === "/dashboard/customer" || href === "/dashboard/admin" ? pathname === href : pathname === href || (pathname.startsWith(href + "/") && !links.some(([h]) => h !== href && h.startsWith(href + "/") && pathname.startsWith(h))));

  return (
    <aside className="border-b border-sand-200 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <button className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium md:hidden" onClick={() => setOpen(!open)}>
        {role === "admin" ? "Admin menu" : "My menu"} <span>{open ? "−" : "+"}</span>
      </button>
      <nav className={`${open ? "block" : "hidden"} space-y-1 p-3 md:sticky md:top-16 md:block md:p-4`}>
        <p className="hidden px-3 pb-2 text-xs font-semibold text-stone-400 md:block">{role === "admin" ? "Admin dashboard" : "Customer dashboard"}</p>
        {links.map(([href, label]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`block rounded-md px-3 py-2 text-sm ${isActive(href) ? "bg-brand-50 font-medium text-brand-700" : "text-stone-600 hover:bg-sand-50"}`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
