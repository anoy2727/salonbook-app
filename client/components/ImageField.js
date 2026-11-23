"use client";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

// Image upload (to ImgBB through our server) with optional "paste image URL" input
export default function ImageField({ value, onChange, allowUrl = true, publicUpload = false }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5 MB.");
    const form = new FormData();
    form.append("image", file);
    setUploading(true);
    try {
      const data = await api(publicUpload ? "/api/upload/public" : "/api/upload", { method: "POST", form, auth: !publicUpload });
      onChange(data.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-sand-200 bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">No image</div>}
      </div>
      <div className="flex-1 space-y-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700" />
        {uploading && <p className="text-xs text-stone-500">Uploading...</p>}
        {allowUrl && <input type="url" className="input" placeholder="...or paste an image URL" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
      </div>
    </div>
  );
}
