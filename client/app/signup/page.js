"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import ImageField from "@/components/ImageField";
import Loader from "@/components/Loader";
import { GoogleButton } from "../signin/page";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [f, setF] = useState({ name: "", email: "", password: "", image: "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { if (!isPending && session?.user) router.replace("/dashboard"); }, [isPending, session, router]);

  async function submit(e) {
    e.preventDefault();
    if (f.name.trim().length < 2) return toast.error("Please enter your full name.");
    if (f.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (!/[A-Z]/.test(f.password)) return toast.error("Password needs one uppercase letter.");
    if (!/[a-z]/.test(f.password)) return toast.error("Password needs one lowercase letter.");
    setLoading(true);
    clearToken();
    const { error } = await authClient.signUp.email({ name: f.name.trim(), email: f.email, password: f.password, image: f.image || undefined });
    if (error) {
      toast.error(error.message || "Could not create your account.");
      setLoading(false);
      return;
    }
    toast.success("Account created! Welcome to SalonBook.");
    router.push("/dashboard");
  }

  if (isPending || session?.user) return <Loader full />;
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl">Create your account</h1>
        <p className="mt-1 text-sm text-stone-600">Book and manage salon appointments online.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required autoComplete="name" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} required autoComplete="email" /></div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={f.password} onChange={(e) => set("password", e.target.value)} required autoComplete="new-password" />
            <p className="mt-1 text-xs text-stone-500">At least 6 characters with one uppercase and one lowercase letter.</p>
          </div>
          <div><label className="label">Profile image (optional)</label><ImageField value={f.image} onChange={(v) => set("image", v)} publicUpload /></div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Sign up"}</button>
        </form>
        <div className="my-5 text-center text-xs text-stone-400">or</div>
        <GoogleButton label="Sign up with Google" />
        <p className="mt-6 text-center text-sm text-stone-600">Already have an account? <Link href="/signin" className="font-medium text-brand-700 hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
