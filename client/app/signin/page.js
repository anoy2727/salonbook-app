"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import Loader from "@/components/Loader";

export function GoogleButton({ label }) {
  const [loading, setLoading] = useState(false);
  return (
    <button type="button" className="btn-outline w-full" disabled={loading} onClick={async () => {
      setLoading(true);
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard", errorCallbackURL: "/signin" });
      if (error) { toast.error(error.message || "Google sign-in failed."); setLoading(false); }
    }}>
      {loading ? "Redirecting..." : label}
    </button>
  );
}

function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isPending && session?.user) router.replace(params.get("redirect") || "/dashboard"); }, [isPending, session, router, params]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    clearToken();
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      toast.error(error.message || "Invalid email or password.");
      setLoading(false);
      return;
    }
    toast.success("Welcome back!");
    router.push("/dashboard"); // dashboard page sends each role to its own dashboard
  }

  if (isPending || session?.user) return <Loader full />;
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl">Sign in</h1>
        <p className="mt-1 text-sm text-stone-600">Welcome back to SalonBook.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
          <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <div className="my-5 text-center text-xs text-stone-400">or</div>
        <GoogleButton label="Continue with Google" />
        <p className="mt-6 text-center text-sm text-stone-600">New here? <Link href="/signup" className="font-medium text-brand-700 hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return <Suspense fallback={<Loader full />}><SignIn /></Suspense>;
}
