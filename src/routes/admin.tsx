import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { isLoggedIn, logout } from "@/lib/auth";
import { LogOut, Package, ShoppingBag, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playNewOrder } from "@/lib/sounds";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Unique Parfum" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // Fetch new-order count on mount
  useEffect(() => {
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "nouveau")
      .then(({ count }) => setNewCount(count ?? 0));
  }, []);

  // Real-time: increment badge when a new order arrives
  useEffect(() => {
    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => { setNewCount((n) => n + 1); playNewOrder(); },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        async () => {
          // Re-fetch count when any order status changes
          const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "nouveau");
          setNewCount(count ?? 0);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  const signOut = () => { logout(); navigate({ to: "/login" }); };

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/perfumes", label: "Parfums", icon: Package },
    { to: "/admin/orders", label: "Commandes", icon: ShoppingBag, badge: newCount },
    { to: "/admin/settings", label: "Paramètres", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/15 bg-noir/60 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/admin" className="font-display text-xl text-gradient-gold">Unique Admin</Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map((l) => {
              const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs tracking-wider uppercase whitespace-nowrap transition ${active ? "bg-gradient-gold text-primary-foreground" : "text-foreground/70 hover:text-primary"}`}>
                  <l.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{l.label}</span>
                  {l.badge != null && l.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-lg">
                      {l.badge > 99 ? "99+" : l.badge}
                      {/* Pulsing ring */}
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                    </span>
                  )}
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
