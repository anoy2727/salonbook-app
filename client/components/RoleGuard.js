"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import Loader from "./Loader";

export const homeFor = (role) => (role === "admin" ? "/dashboard/admin" : "/dashboard/customer");

// Wrap a page: unauthenticated -> sign in, blocked -> signed out, wrong role -> own dashboard.
// (The Express server ALSO checks the role on every protected API.)
export default function RoleGuard({ role, children }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const user = session?.user;
  const allowed = user && !user.isBlocked && (!role || user.role === role);

  useEffect(() => {
    if (isPending) return;
    if (!user) router.replace("/signin");
    else if (user.isBlocked) {
      toast.error("Your account has been blocked.");
      clearToken();
      authClient.signOut().then(() => router.replace("/signin"));
    } else if (role && user.role !== role) {
      toast.error("You do not have access to that page.");
      router.replace(homeFor(user.role));
    }
  }, [isPending, user, role, router]);

  if (isPending || !allowed) return <Loader full />;
  return children;
}
