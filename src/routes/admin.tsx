import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth, ADMIN_EMAIL } from "@/lib/auth";
import { Loader2, LogOut, Package, ShoppingBag, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Unique Parfum" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  const { loading, isAuthenticated, isAdmin, email, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  if (!isAuthenticated) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center glass gold-border rounded-3xl p-8">
          <h1 className="font-display text-3xl mb-3">Accès refusé</h1>
          <p className="text-sm text-muted-foreground mb-2">Cet espace est réservé à l'administrateur.</p>
          <p className="text-xs text-muted-foreground mb-6">Connecté en tant que : <span className="text-primary">{email}</span></p>
          <p className="text-xs text-muted-foreground mb-6">Seul <span className="text-primary">{ADMIN_EMAIL}</span> peut accéder à cet espace.</p>
          <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="px-6 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium">Déconnexion</button>
        </div>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/perfumes", label: "Parfums", icon: Package },
    { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
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
                <Link key={l.to} to={l.to} className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs tracking-wider uppercase whitespace-nowrap transition ${active ? "bg-gradient-gold text-primary-foreground" : "text-foreground/70 hover:text-primary"}`}>
                  <l.icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
            <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
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
