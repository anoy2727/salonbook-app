"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setMenu(false); setOpen(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function logout() {
    clearToken();
    await authClient.signOut();
    toast.success("Signed out successfully.");
    router.push("/");
  }

  const links = [["/", "Home"], ["/services", "Browse Services"], ...(user ? [["/salon", "Salon Details"]] : [])];
  const active = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkCls = (href) => `rounded-md px-3 py-2 text-sm ${active(href) ? "bg-brand-50 font-medium text-brand-700" : "text-stone-600 hover:text-brand-700"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-2xl text-brand-700">SalonBook</Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(([href, label]) => <Link key={href} href={href} className={linkCls(href)}>{label}</Link>)}
          {user && <Link href="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isPending ? <div className="h-9 w-24 animate-pulse rounded-md bg-sand-100" /> : user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-sand-200 py-1 pl-1 pr-3 hover:bg-sand-50" aria-haspopup="menu" aria-expanded={open}>
                <Avatar user={user} />
                <span className="max-w-[120px] truncate text-sm">{user.name}</span>
              </button>
              {open && (
                <div className="card absolute right-0 mt-2 w-52 py-1 shadow-lg" role="menu">
                  <p className="truncate border-b border-sand-100 px-4 py-2 text-sm font-medium">{user.name}</p>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-sand-50" role="menuitem">Dashboard</Link>
                  <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-sand-50" role="menuitem">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="btn-outline">Sign In</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className="rounded-md p-2 md:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
          <span className="block h-0.5 w-6 bg-stone-700" /><span className="mt-1.5 block h-0.5 w-6 bg-stone-700" /><span className="mt-1.5 block h-0.5 w-6 bg-stone-700" />
        </button>
      </nav>

      {menu && (
        <div className="space-y-1 border-t border-sand-200 bg-white px-4 py-3 md:hidden">
          {links.map(([href, label]) => <Link key={href} href={href} className={`block ${linkCls(href)}`}>{label}</Link>)}
          {user ? (
            <>
              <Link href="/dashboard" className={`block ${linkCls("/dashboard")}`}>Dashboard ({user.name})</Link>
              <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/signin" className="btn-outline flex-1">Sign In</Link>
              <Link href="/signup" className="btn-primary flex-1">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function Avatar({ user, size = 8 }) {
  const dim = `h-${size} w-${size}`;
  return user?.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="" className={`${dim} rounded-full object-cover`} style={{ height: size * 4, width: size * 4 }} />
  ) : (
    <span className="flex items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700" style={{ height: size * 4, width: size * 4 }}>
      {(user?.name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
