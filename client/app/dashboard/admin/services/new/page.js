import ServiceForm from "@/components/ServiceForm";

export default function NewService() {
  return (<div><h1 className="text-2xl">Add service</h1><p className="mb-6 mt-1 text-stone-600">New services are active by default.</p><ServiceForm /></div>);
}
