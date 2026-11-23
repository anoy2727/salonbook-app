"use client";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import ServiceForm from "@/components/ServiceForm";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";

export default function EditService() {
  const { id } = useParams();
  const { data, loading, error, reload } = useAsync(() => api(`/api/admin/services/${id}`), [id]);
  return (
    <div>
      <h1 className="text-2xl">Update service</h1>
      <div className="mt-6">{loading ? <Loader /> : error ? <ErrorMessage error={error} onRetry={reload} /> : <ServiceForm service={data} />}</div>
    </div>
  );
}
