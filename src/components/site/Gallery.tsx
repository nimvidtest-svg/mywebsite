import { motion } from "framer-motion";
import black from "@/assets/bottle-black.jpg";
import gold from "@/assets/bottle-gold.jpg";
import green from "@/assets/bottle-green.jpg";
import turquoise from "@/assets/bottle-turquoise.jpg";
import burgundy from "@/assets/bottle-burgundy.jpg";

const items = [
  { src: black, name: "Noir Élégance" },
  { src: gold, name: "Or Royal" },
  { src: burgundy, name: "Rouge Velours" },
  { src: turquoise, name: "Bleu Lagon" },
  { src: green, name: "Vert Émeraude" },
];

export function Gallery() {
  return (
    <section id="galerie" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Galerie</p>
          <h2 className="font-display text-5xl md:text-6xl">
            L'art du <span className="italic text-gradient-gold">flacon</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, y: -8 }}
              className={`group relative glass gold-border rounded-3xl overflow-hidden aspect-[3/4] ${
                i === 0 || i === 3 ? "md:translate-y-8" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
              <motion.img
                src={it.src}
                alt={`Unique Parfum — ${it.name}`}
                loading="lazy"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                className="relative w-full h-full object-contain p-3 md:p-4 group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-4 inset-x-0 text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase text-primary/90">{it.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
