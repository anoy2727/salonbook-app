import Link from "next/link";
import { SALON } from "@/lib/salon";

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl text-white">{SALON.name}</p>
          <p className="mt-3 text-sm text-brand-200">{SALON.tagline} Haircuts, color, skincare, nails and spa treatments with trusted professionals.</p>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/services" className="hover:text-white">Browse Services</Link></li>
            <li><Link href="/signin" className="hover:text-white">Sign In</Link></li>
            <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{SALON.phone}</li>
            <li>{SALON.email}</li>
            <li>{SALON.address}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Opening hours</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {SALON.hours.map(([d, h]) => <li key={d}>{d}: {h}</li>)}
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            {SALON.social.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="hover:text-white">{name}</a>)}
          </div>
        </div>
      </div>
      <p className="border-t border-brand-700 py-4 text-center text-xs text-brand-200">© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
    </footer>
  );
}
