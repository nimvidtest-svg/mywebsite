import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

export const Route = createFileRoute("/adminpannel/")({ component: Dashboard });

function Dashboard() {
  const { data: perfumeCount } = useQuery({
    queryKey: ["count", "perfumes"],
    queryFn: async () => {
      const { count } = await supabase.from("perfumes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Bienvenue 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Aperçu de votre boutique.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/adminpannel/perfumes"
          className="glass gold-border rounded-2xl p-6 hover:scale-[1.02] transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-[0.2em] text-primary uppercase">Parfums</span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="font-display text-4xl text-gradient-gold">{perfumeCount ?? "—"}</p>
        </Link>
      </div>
    </div>
  );
}
