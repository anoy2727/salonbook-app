"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { homeFor } from "@/components/RoleGuard";
import Loader from "@/components/Loader";

// /dashboard sends every user to the dashboard of their own role
export default function DashboardRedirect() {
  const { data } = authClient.useSession();
  const router = useRouter();
  useEffect(() => { if (data?.user) router.replace(homeFor(data.user.role)); }, [data, router]);
  return <Loader full />;
}
