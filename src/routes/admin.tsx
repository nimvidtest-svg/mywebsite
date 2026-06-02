import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { isLoggedIn, logout, login } from "@/lib/auth";
import { LogOut, Package, ShoppingBag, LayoutDashboard, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playNewOrder, unlockAudio } from "@/lib/sounds";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Unique Parfum" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const prevCount = useRef(0);

  // Fetch count helper
  const fetchCount = async () => {
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "nouveau");
    const n = count ?? 0;
    if (n > prevCount.current && prevCount.current !== -1) {
      if (soundOn) playNewOrder();
    }
    prevCount.current = n;
    setNewCount(n);
  };

  // Initial fetch + polling every 20 s (fallback if realtime not enabled)
  useEffect(() => {
    prevCount.current = -1; // skip sound on first load
    fetchCount().then(() => { prevCount.current = newCount; });
    const timer = setInterval(fetchCount, 20_000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setNewCount((n) => {
          if (soundOn) playNewOrder();
          return n + 1;
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, fetchCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  // Auth guard
  useEffect(() => {
    if (isLoggedIn()) setReady(true);
  }, [navigate]);

  if (!ready) return <LoginForm onSuccess={() => setReady(true)} />;

  const signOut = () => { logout(); setReady(false); };

  const links = [
    { to: "/admin",          label: "Dashboard",   icon: LayoutDashboard, exact: true },
    { to: "/admin/perfumes", label: "Parfums",      icon: Package },
    { to: "/admin/orders",   label: "Commandes",    icon: ShoppingBag, badge: newCount },
  ];

  return (
    // Unlock AudioContext on first click anywhere in the admin layout
    <div className="min-h-screen bg-background text-foreground" onClick={unlockAudio}>
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
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Sound toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); unlockAudio(); setSoundOn((s) => !s); }}
              title={soundOn ? "Désactiver le son" : "Activer le son"}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs tracking-wider uppercase transition ${soundOn ? "text-primary" : "text-foreground/30"}`}>
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{soundOn ? "Son ON" : "Son OFF"}</span>
            </button>

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

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (login(password)) onSuccess();
    else setErr(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md glass gold-border rounded-3xl p-8">
        <Link to="/" className="text-xs tracking-[0.3em] text-primary uppercase">← Retour</Link>
        <h1 className="font-display text-4xl mt-4 mb-2">
          <span className="shimmer-text italic">Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Entrez le mot de passe admin.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Mot de passe</label>
            <input required type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(false); }}
              className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none" />
          </div>
          {err && <p className="text-sm text-destructive">Mot de passe incorrect.</p>}
          <button type="submit"
            className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold flex items-center justify-center">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
