import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import { fetchPerfumes, categories, type Category } from "@/lib/api";
import { PerfumeCard } from "./PerfumeCard";

export function Catalogue() {
  const [active, setActive] = useState<Category>("BEST SELLERS");
  const [query, setQuery] = useState("");

  const { data: perfumes = [], isLoading } = useQuery({
    queryKey: ["perfumes"],
    queryFn: fetchPerfumes,
  });

  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    return perfumes.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      // When searching, ignore category and search everything
      if (q) return matchQ;
      const matchCat = active === "BEST SELLERS" ? p.best_seller : p.category === active;
      return matchCat;
    });
  }, [active, q, perfumes]);

  return (
    <section id="catalogue" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Notre Collection</p>
          <h2 className="font-display text-5xl md:text-6xl mb-4">
            Le <span className="italic text-gradient-gold">Catalogue</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explorez notre sélection de fragrances inspirées des maisons les plus prestigieuses au monde.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom ou marque..."
              className="w-full glass rounded-full pl-11 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition-all ${
                active === c
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "glass text-foreground/70 hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>


        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <PerfumeCard perfume={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && list.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucun parfum trouvé.</p>
        )}
      </div>
    </section>
  );
}
