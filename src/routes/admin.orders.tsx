import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type OrderRow, orderStatusLabel, type OrderStatus } from "@/lib/api";
import { Loader2, Trash2, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  const setStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["orders"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    await supabase.from("orders").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Commandes <span className="text-muted-foreground text-base">({orders.length})</span></h1>
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : orders.length === 0 ? (
        <p className="text-muted-foreground">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="glass gold-border rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${o.status === "nouveau" ? "bg-primary/20 text-primary" : o.status === "livre" ? "bg-emerald-500/20 text-emerald-400" : o.status === "annule" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-400"}`}>{orderStatusLabel[o.status as OrderStatus] ?? o.status}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.type}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  <h3 className="font-display text-xl mt-1">{o.customer_name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <a href={`tel:${o.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="w-3 h-3" /> {o.phone}</a>
                    {(o.city || o.address) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {[o.address, o.city].filter(Boolean).join(", ")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {o.total != null && <span className="font-display text-xl text-gradient-gold">{o.total} DH</span>}
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg bg-noir border border-primary/20">
                    {(["nouveau","confirme","livre","annule"] as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>{orderStatusLabel[s]}</option>
                    ))}
                  </select>
                  <button onClick={() => remove(o.id)} className="w-8 h-8 rounded-full glass flex items-center justify-center hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <ul className="text-sm text-foreground/80 space-y-1 ml-1">
                {o.items.map((it, i) => (
                  <li key={i}>· {it.name}{it.qty ? ` × ${it.qty}` : ""}</li>
                ))}
              </ul>
              {o.notes && <p className="text-xs text-muted-foreground mt-2 italic">{o.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
