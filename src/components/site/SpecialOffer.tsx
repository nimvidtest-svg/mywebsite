import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Tag } from "lucide-react";
import { fetchPerfumes, createOrder } from "@/lib/api";
import { openWhatsapp } from "@/lib/whatsapp";

export function SpecialOffer() {
  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });

  const featured = [
    ...perfumes.filter((p) => p.best_seller),
    ...perfumes.filter((p) => !p.best_seller),
  ].slice(0, 3);

  if (!featured.length) return null;

  const discountPct = 20;
  const oldPrice = (price: number) => Math.round(price / (1 - discountPct / 100));

  const order = (p: (typeof perfumes)[0]) => {
    createOrder({
      customer_name: "Client WhatsApp",
      phone: "", city: null, address: null,
      items: [{ name: p.name, qty: 1 }],
      total: p.price, type: "whatsapp", notes: "Special Offer",
    }).catch(() => {});
    openWhatsapp(`Bonjour Unique Parfum, je souhaite commander : ${p.name} (${p.brand}) - ${p.price} DH`);
  };

  return (
    <section id="offre" className="relative py-20 md:py-28 bg-noir overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-[0.3em] text-primary uppercase">Offres Spéciales</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            Special <span className="italic text-gradient-gold">Offers</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Profitez de nos offres exclusives sur nos parfums les plus appréciés.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative glass gold-border rounded-3xl overflow-hidden flex flex-col"
            >
              {/* Discount badge */}
              <div className="absolute top-4 right-4 z-10 bg-gradient-gold text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-gold">
                -{discountPct}%
              </div>

              {p.best_seller && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-gold/80 text-primary-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                  Best Seller
                </div>
              )}

              {/* Image */}
              <div className="bg-black h-56 flex items-center justify-center overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 drop-shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[10px] tracking-[0.2em] text-primary/80 uppercase mb-1 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> {p.brand}
                </p>
                <h3 className="font-display text-xl text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{p.description}</p>

                {/* Prices */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-display text-3xl text-gradient-gold">{p.price} DH</span>
                  <span className="text-sm text-muted-foreground line-through">{oldPrice(p.price)} DH</span>
                </div>

                <button
                  type="button"
                  onClick={() => order(p)}
                  disabled={p.stock_status === "out_of_stock"}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium text-sm shadow-gold hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <MessageCircle className="w-4 h-4" />
                  Commander
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
