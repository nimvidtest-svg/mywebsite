import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { isLoggedIn, logout } from "@/lib/auth";
import { LogOut, Package, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/adminpannel")({
  component: AdminLayout,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isLoggedIn()) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({ meta: [{ title: "Admin · Unique Parfum" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) navigate({ to: "/admin" });
    else setReady(true);
  }, [navigate]);

  if (!ready) return null;

  const signOut = () => { logout(); navigate({ to: "/admin" }); };

  const links = [
    { to: "/adminpannel",          label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/adminpannel/perfumes", label: "Parfums",    icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/15 bg-noir/60 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/adminpannel" className="font-display text-xl text-gradient-gold">Unique Admin</Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map((l) => {
              const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs tracking-wider uppercase whitespace-nowrap transition ${active ? "bg-gradient-gold text-primary-foreground" : "text-foreground/70 hover:text-primary"}`}>
                  <l.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
            <button onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-xs tracking-wider uppercase text-foreground/60 hover:text-destructive transition">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sortir</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
