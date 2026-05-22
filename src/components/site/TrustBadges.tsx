import { Wallet, Truck, Gift } from "lucide-react";

const items = [
  { icon: Wallet, title: "Paiement à la livraison", sub: "Réglez en cash à la réception" },
  { icon: Truck, title: "Livraison 24h–72h", sub: "Partout au Maroc, gratuite" },
  { icon: Gift, title: "Testeur offert", sub: "Avec chaque commande" },
];

export function TrustBadges() {
  return (
    <section className="relative py-10 md:py-14 border-y border-primary/10 bg-noir/50">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-4 glass rounded-2xl p-5">
            <div className="w-12 h-12 rounded-full glass-gold flex items-center justify-center flex-shrink-0">
              <it.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-lg text-foreground">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
