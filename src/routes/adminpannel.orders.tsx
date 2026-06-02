import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type OrderRow, orderStatusLabel, type OrderStatus } from "@/lib/api";
import { Loader2, Trash2, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/adminpannel/orders")({ component: AdminOrders });

const STATUS_CONFIG: Record<OrderStatus, { border: string; bg: string; text: string; check: string }> = {
  nouveau:  { border: "border-primary/60",     bg: "bg-primary/10",      text: "text-primary",      check: "accent-amber-400" },
  confirme: { border: "border-blue-500/70",    bg: "bg-blue-500/10",     text: "text-blue-400",     check: "accent-blue-400" },
  livre:    { border: "border-emerald-500/70", bg: "bg-emerald-500/10",  text: "text-emerald-400",  check: "accent-emerald-400" },
  annule:   { border: "border-destructive/70", bg: "bg-destructive/10",  text: "text-destructive",  check: "accent-red-400" },
};

const STATUSES: OrderStatus[] = ["nouveau", "confirme", "livre", "annule"];

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
      <h1 className="font-display text-3xl">
        Commandes <span className="text-muted-foreground text-base">({orders.length})</span>
      </h1>
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const cfg = STATUS_CONFIG[o.status as OrderStatus] ?? STATUS_CONFIG.nouveau;
            return (
              <div key={o.id} className={`glass rounded-2xl p-5 border-2 transition-colors duration-300 ${cfg.border}`}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                        {orderStatusLabel[o.status as OrderStatus] ?? o.status}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.type}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <h3 className="font-display text-xl mt-1">{o.customer_name}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <a href={`tel:${o.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Phone className="w-3 h-3" /> {o.phone}
                      </a>
                      {(o.city || o.address) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {[o.address, o.city].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {o.total != null && <span className="font-display text-xl text-gradient-gold">{o.total} DH</span>}
                    <button onClick={() => remove(o.id)} className="w-8 h-8 rounded-full glass flex items-center justify-center hover:text-destructive transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <ul className="text-sm text-foreground/80 space-y-1 ml-1 mb-4">
                  {o.items.map((it, i) => (<li key={i}>· {it.name}{it.qty ? ` × ${it.qty}` : ""}</li>))}
                </ul>
                {o.notes && <p className="text-xs text-muted-foreground mb-4 italic">{o.notes}</p>}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
                  {STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer select-none group">
                      <input type="radio" name={`status-${o.id}`} checked={o.status === s} onChange={() => setStatus(o.id, s)}
                        className={`w-4 h-4 cursor-pointer ${STATUS_CONFIG[s].check}`} />
                      <span className={`text-xs font-medium transition ${o.status === s ? STATUS_CONFIG[s].text : "text-muted-foreground group-hover:text-foreground"}`}>
                        {orderStatusLabel[s]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
