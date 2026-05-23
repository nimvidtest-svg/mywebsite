import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import bottleHomme from "@/assets/bottle-homme.png";
import bottleFemme from "@/assets/bottle-femme.png";
import bottleMixte from "@/assets/bottle-mixte.png";
import bottleGold from "@/assets/bottle-gold.jpg";

const CATEGORIES = [
  {
    label: "Men's Perfume",
    sublabel: "Bold & Masculine",
    image: bottleHomme,
    hash: "homme",
    gradient: "from-slate-900 via-blue-950 to-slate-900",
    accent: "border-blue-500/30",
  },
  {
    label: "Women's Perfume",
    sublabel: "Elegant & Feminine",
    image: bottleFemme,
    hash: "femme",
    gradient: "from-rose-950 via-pink-950 to-slate-900",
    accent: "border-rose-500/30",
  },
  {
    label: "Unisex",
    sublabel: "For Everyone",
    image: bottleMixte,
    hash: "mixte",
    gradient: "from-purple-950 via-slate-900 to-teal-950",
    accent: "border-purple-500/30",
  },
  {
    label: "Luxury Collection",
    sublabel: "Niche & Oriental",
    image: bottleGold,
    hash: "niche",
    gradient: "from-amber-950 via-stone-900 to-slate-900",
    accent: "border-amber-500/30",
  },
];

export function Categories() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-[0.3em] text-primary uppercase">Our Collections</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            Browse by <span className="italic text-gradient-gold">Category</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.a
              key={cat.label}
              href={`#catalogue`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative rounded-3xl overflow-hidden border ${cat.accent} flex flex-col items-center justify-end text-center cursor-pointer h-64 md:h-80`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />

              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Bottle image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-4/5 w-auto object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
              </div>

              {/* Dark overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Text */}
              <div className="relative z-10 p-5 w-full">
                <p className="font-display text-lg md:text-xl text-foreground leading-tight">{cat.label}</p>
                <p className="text-xs text-foreground/60 mt-0.5 mb-2">{cat.sublabel}</p>
                <span className="inline-flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-all">
                  Shop now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
