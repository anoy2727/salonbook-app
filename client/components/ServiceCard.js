import Link from "next/link";
import { money } from "@/lib/utils";

export default function ServiceCard({ service }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="aspect-[4/3] bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.image} alt={service.serviceName} loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-brand-600">{service.category}</p>
        <h3 className="mt-1 text-lg leading-snug">{service.serviceName}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-stone-600">{service.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-stone-900">{money(service.price)}</span>
          <span className="text-stone-500">{service.duration} min</span>
        </div>
        <Link href={`/services/${service._id}`} className="btn-primary mt-4">View details</Link>
      </div>
    </article>
  );
}
