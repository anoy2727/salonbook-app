"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/utils";
import ImageField from "./ImageField";

// Used by both "Add service" and "Update service"
export default function ServiceForm({ service }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    serviceName: service?.serviceName || "",
    category: service?.category || CATEGORIES[0],
    description: service?.description || "",
    price: service?.price ?? "",
    duration: service?.duration ?? "",
    image: service?.image || "",
    status: service?.status || "active",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!f.image) return toast.error("Please upload a service image.");
    if (!(Number(f.price) > 0)) return toast.error("Price must be a positive number.");
    if (!(Number(f.duration) > 0)) return toast.error("Duration must be a positive number.");
    setSaving(true);
    try {
      const body = { ...f, price: Number(f.price), duration: Number(f.duration) };
      if (service) await api(`/api/admin/services/${service._id}`, { method: "PUT", body });
      else await api("/api/admin/services", { method: "POST", body });
      toast.success(service ? "Service updated successfully." : "Service added successfully.");
      router.push("/dashboard/admin/services");
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="serviceName">Service name</label>
          <input id="serviceName" className="input" value={f.serviceName} onChange={(e) => set("serviceName", e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">Price (USD)</label>
          <input id="price" type="number" min="0.01" step="0.01" className="input" value={f.price} onChange={(e) => set("price", e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="duration">Estimated duration (minutes)</label>
          <input id="duration" type="number" min="1" step="1" className="input" value={f.duration} onChange={(e) => set("duration", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" rows={4} className="input" value={f.description} onChange={(e) => set("description", e.target.value)} required />
      </div>
      <div>
        <label className="label">Service image (upload)</label>
        <ImageField value={f.image} onChange={(v) => set("image", v)} allowUrl={false} />
      </div>
      <div>
        <label className="label" htmlFor="status">Status</label>
        <select id="status" className="input sm:w-48" value={f.status} onChange={(e) => set("status", e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : service ? "Update service" : "Add service"}</button>
        <button type="button" className="btn-outline" onClick={() => router.push("/dashboard/admin/services")}>Cancel</button>
      </div>
    </form>
  );
}
