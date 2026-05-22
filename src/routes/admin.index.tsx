import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data: perfumeCount } = useQuery({
    queryKey: ["count", "perfumes"],
    queryFn: async () => {
      const { count } = await supabase.from("perfumes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: orderStats } = useQuery({
    queryKey: ["count", "orders"],
    queryFn: async () => {
      const { count: total } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: news } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "new");
      return { total: total ?? 0, news: news ?? 0 };
    },
  });

  const cards = [
    { label: "Parfums", value: perfumeCount ?? "—", icon: Package, to: "/admin/perfumes" },
    { label: "Commandes", value: orderStats?.total ?? "—", icon: ShoppingBag, to: "/admin/orders" },
    { label: "Nouvelles commandes", value: orderStats?.news ?? "—", icon: Sparkles, to: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Bienvenue 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Aperçu de votre boutique.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="glass gold-border rounded-2xl p-6 hover:scale-[1.02] transition group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-[0.2em] text-primary uppercase">{c.label}</span>
              <c.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display text-4xl text-gradient-gold">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
