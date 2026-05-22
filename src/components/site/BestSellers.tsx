import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { fetchPerfumes, type Perfume } from "@/lib/api";
import { PerfumeCard } from "./PerfumeCard";
import { useState } from "react";

export function BestSellers() {
  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });
  const list = perfumes.filter((p) => p.best_seller).slice(0, 8);
  const [, setSel] = useState<Perfume | null>(null);

  if (!list.length) return null;

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
            Nos parfums <span className="italic text-gradient-gold">les plus aimés</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {list.map((p) => (
            <PerfumeCard key={p.id} perfume={p} onOpen={setSel} />
          ))}
        </div>
      </div>
    </section>
  );
}
