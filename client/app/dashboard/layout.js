"use client";
import { authClient } from "@/lib/auth-client";
import RoleGuard from "@/components/RoleGuard";
import Sidebar from "@/components/Sidebar";

function Shell({ children }) {
  const { data } = authClient.useSession();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <Sidebar role={data?.user?.role} />
      <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return <RoleGuard><Shell>{children}</Shell></RoleGuard>;
}
