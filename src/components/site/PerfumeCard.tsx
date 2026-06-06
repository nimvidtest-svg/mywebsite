import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Perfume } from "@/lib/api";

export function PerfumeCard({ perfume }: { perfume: Perfume }) {
  const out = perfume.stock_status === "out_of_stock";
  const low = perfume.stock_status === "low_stock";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative glass gold-border rounded-3xl overflow-hidden flex flex-col"
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {perfume.best_seller && (
          <div className="bg-gradient-gold text-primary-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
            Best Seller
          </div>
        )}
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
        50ml · {perfume.price} DH
      </div>

      <Link
        to="/parfum/$id"
        params={{ id: perfume.id }}
        className="relative w-full h-[260px] md:h-[320px] bg-black overflow-hidden flex items-center justify-center"
      >
        <img
          src={perfume.image_url}
          alt={perfume.name}
          loading="lazy"
          className="relative w-full h-full object-contain p-2 md:p-3 group-hover:scale-115 transition-transform duration-700 drop-shadow-lg"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.2em] text-primary/80 uppercase mb-1">{perfume.brand} · {perfume.gender}</p>
        <Link to="/parfum/$id" params={{ id: perfume.id }}>
          <h3 className="font-display text-2xl text-foreground mb-2 hover:text-primary transition-colors">{perfume.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">{perfume.description}</p>
      </div>
    </motion.div>
  );
}
