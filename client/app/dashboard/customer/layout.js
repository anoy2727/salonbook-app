"use client";
import RoleGuard from "@/components/RoleGuard";

export default function CustomerLayout({ children }) {
  return <RoleGuard role="customer">{children}</RoleGuard>;
}
