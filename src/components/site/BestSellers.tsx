import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown, Star, Eye, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchPerfumes, createOrder } from "@/lib/api";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.floor(rating) ? "text-primary fill-primary" : s - 0.5 <= rating ? "text-primary fill-primary/40" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function getRating(_idx: number) {
  return 5;
}

export function BestSellers() {
  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });
  const list = perfumes.filter((p) => p.best_seller).slice(0, 8);

  if (!list.length) return null;

  const order = (p: (typeof perfumes)[0]) => {
    createOrder({
      customer_name: "Client",
      phone: "", city: null, address: null,
      items: [{ name: p.name, qty: 1 }],
      total: p.price, type: "standard", notes: null,
    }).catch(() => {});
  };

  return (
    <section className="relative py-20 md:py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-[0.3em] text-primary uppercase">Best Sellers</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            Nos Parfums <span className="italic text-gradient-gold">les Plus Aimés</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {list.map((p, i) => {
            const out = p.stock_status === "out_of_stock";
            const low = p.stock_status === "low_stock";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative glass gold-border rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                  <div className="bg-gradient-gold text-primary-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                    Best Seller
                  </div>
                  {out && (
                    <div className="bg-destructive/90 text-destructive-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                      Rupture
                    </div>
                  )}
                  {low && !out && (
                    <div className="bg-amber-500/90 text-black text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                      Stock limité
                    </div>
                  )}
                </div>
                <div className="absolute top-4 right-4 z-10 glass-gold text-primary text-xs tracking-wider px-3 py-1 rounded-full font-semibold">
                  50ml · {p.price} DH
                </div>

                <Link to="/parfum/$id" params={{ id: p.id }} className="relative bg-black h-[220px] md:h-[260px] flex items-center justify-center overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700 drop-shadow-lg"
                  />
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] tracking-[0.2em] text-primary/80 uppercase mb-1">{p.brand} · {p.gender}</p>
                  <h3 className="font-display text-xl text-foreground mb-1.5">{p.name}</h3>
                  <div className="mb-2">
                    <StarRating rating={getRating(i)} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{p.description}</p>

                  <div className="flex flex-col gap-2">
                    <Link
                      to="/parfum/$id"
                      params={{ id: p.id }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Voir le produit
                    </Link>
                    <button
                      type="button"
                      onClick={() => order(p)}
                      disabled={out}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium shadow-gold hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {out ? "Indisponible" : "Commander"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
