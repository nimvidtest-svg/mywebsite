import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type OrderRow, type OrderStatus, orderStatusLabel } from "@/lib/api";
import { Package, ShoppingBag, Sparkles, Phone, MapPin, Bell } from "lucide-react";

export const Route = createFileRoute("/adminpannel/")({ component: Dashboard });

function Dashboard() {
  const qc = useQueryClient();

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
      const { count: news } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "nouveau");
      return { total: total ?? 0, news: news ?? 0 };
    },
  });

  const { data: newOrders = [] } = useQuery({
    queryKey: ["orders", "nouveau"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "nouveau")
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as OrderRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["count", "orders"] });
        qc.invalidateQueries({ queryKey: ["orders", "nouveau"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const cards = [
    { label: "Parfums", value: perfumeCount ?? "—", icon: Package, to: "/adminpannel/perfumes", color: "text-primary" },
    { label: "Total Commandes", value: orderStats?.total ?? "—", icon: ShoppingBag, to: "/adminpannel/orders", color: "text-primary" },
    { label: "Nouvelles Commandes", value: orderStats?.news ?? "—", icon: Sparkles, to: "/adminpannel/orders", color: "text-red-400", live: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Bienvenue 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Aperçu de votre boutique.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}
            className="glass gold-border rounded-2xl p-6 hover:scale-[1.02] transition group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-[0.2em] text-primary uppercase">{c.label}</span>
              <div className="relative">
                <c.icon className={`w-5 h-5 ${c.color}`} />
                {c.live && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500">
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping" />
                  </span>
                )}
              </div>
            </div>
            <p className={`font-display text-4xl ${c.live ? "text-red-400" : "text-gradient-gold"}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      {newOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-400" />
            <h2 className="font-display text-xl">Nouvelles Commandes</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              {newOrders.length} en attente
            </span>
          </div>
          <div className="space-y-2">
            {newOrders.map((o) => (
              <Link key={o.id} to="/adminpannel/orders"
                className="glass rounded-xl p-4 border border-primary/20 hover:border-primary/50 transition flex flex-wrap items-start justify-between gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-red-500/20 text-red-400">
                      {orderStatusLabel[o.status as OrderStatus] ?? o.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  <p className="font-medium truncate">{o.customer_name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.phone}</span>
                    {(o.city || o.address) && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[o.address, o.city].filter(Boolean).join(", ")}</span>
                    )}
                  </div>
                  <ul className="mt-1 text-xs text-foreground/70 space-y-0.5">
                    {o.items.map((it, i) => (<li key={i}>· {it.name}{it.qty ? ` × ${it.qty}` : ""}</li>))}
                  </ul>
                </div>
                {o.total != null && <span className="font-display text-lg text-gradient-gold shrink-0">{o.total} DH</span>}
              </Link>
            ))}
          </div>
          <Link to="/adminpannel/orders" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
            Voir toutes les commandes →
          </Link>
        </div>
      )}

      {newOrders.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm border border-primary/10">
          Aucune nouvelle commande en attente.
        </div>
      )}
    </div>
  );
}
