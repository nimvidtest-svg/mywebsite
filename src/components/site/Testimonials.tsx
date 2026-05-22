import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Sara B.", city: "Casablanca", text: "Incroyable tenue ! Mon parfum dure toute la journée, je suis bluffée." },
  { name: "Yassine M.", city: "Rabat", text: "Le parfum ressemble énormément à l'original. Service impeccable." },
  { name: "Imane K.", city: "Marrakech", text: "Qualité premium à petit prix. J'ai déjà commandé 3 fois !" },
  { name: "Mehdi A.", city: "Tanger", text: "Livraison rapide et parfum magnifique. Hautement recommandé." },
  { name: "Lina F.", city: "Agadir", text: "Le packaging est élégant et le sillage est divin. Merci !" },
  { name: "Omar T.", city: "Fès", text: "Bleu Royal est devenu ma signature. Bravo Unique Parfum." },
];

export function Testimonials() {
  return (
    <section id="avis" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Témoignages</p>
          <h2 className="font-display text-5xl md:text-6xl">
            Ils nous font <span className="italic text-gradient-gold">confiance</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass gold-border rounded-3xl p-7"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/90 mb-6 font-display text-xl italic leading-relaxed">"{r.text}"</p>
              <div>
                <div className="text-sm font-medium text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
