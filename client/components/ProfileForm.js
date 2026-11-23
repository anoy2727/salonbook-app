"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import ImageField from "./ImageField";
import Loader from "./Loader";

export default function ProfileForm() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  if (isPending || !user) return <Loader />;
  const values = form || { name: user.name || "", phone: user.phone || "", image: user.image || "" };
  const set = (k, v) => setForm({ ...values, [k]: v });

  async function save(e) {
    e.preventDefault();
    if (values.name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
    setSaving(true);
    try {
      await api("/api/me", { method: "PATCH", body: values });
      await refetch();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card max-w-xl space-y-5 p-6">
      <div>
        <label className="label">Profile image</label>
        <ImageField value={values.image} onChange={(v) => set("image", v)} />
      </div>
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" className="input" value={values.name} onChange={(e) => set("name", e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="input bg-sand-50" value={user.email} disabled />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone number</label>
        <input id="phone" className="input" placeholder="+880 1XXX XXXXXX" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
    </form>
  );
}
