import { motion } from "framer-motion";
import { Sparkles, Award, Leaf, HeartHandshake } from "lucide-react";
import offerImg from "@/assets/offer-3parfums.jpeg";

const PILLARS = [
  { icon: Award, label: "Qualité Premium", desc: "Inspiré des grandes maisons" },
  { icon: Leaf, label: "Longue Tenue", desc: "Concentration Extrait de Parfum" },
  { icon: HeartHandshake, label: "Pour Tous", desc: "Le luxe à votre portée" },
];

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28 bg-noir overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden glass gold-border h-[380px] md:h-[480px]">
              <img
                src={offerImg}
                alt="Collection Unique Parfum"
                className="w-full h-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs tracking-[0.2em] text-primary uppercase">Notre collection</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs tracking-[0.3em] text-primary uppercase">Notre Histoire</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">
              L'Art du Luxe <span className="italic text-gradient-gold">Accessible</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Née à Salé, au Maroc, Unique Parfum a été créée avec une seule mission : mettre les fragrances
              emblématiques du monde entier à la portée de tous. Nos inspirations capturent l'âme de la parfumerie
              de luxe — sans le prix du luxe.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Chaque flacon est un Extrait de Parfum — la concentration la plus élevée disponible — garantissant
              que votre parfum dure du matin au soir. Nous croyons que sentir bon devrait être un plaisir quotidien,
              pas une occasion rare.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {PILLARS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass rounded-2xl p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>

            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Explorer notre collection
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
