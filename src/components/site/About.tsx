import { motion } from "framer-motion";
import { Sparkles, Award, Leaf, HeartHandshake } from "lucide-react";
import offerImg from "@/assets/offer-3parfums.jpeg";

const PILLARS = [
  { icon: Award, label: "Premium Quality", desc: "Inspired by iconic global maisons" },
  { icon: Leaf, label: "Long Lasting", desc: "Extrait de Parfum concentration" },
  { icon: HeartHandshake, label: "Made for You", desc: "Accessible luxury for everyone" },
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
                alt="Unique Parfum collection"
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
            {/* Decorative glow */}
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
              <span className="text-xs tracking-[0.3em] text-primary uppercase">Our Story</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">
              The Art of <span className="italic text-gradient-gold">Affordable</span> Luxury
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Born in Salé, Morocco, Unique Parfum was created with a single mission: to bring the world's most iconic
              fragrances within reach of everyone. Our expertly crafted inspirations capture the soul of luxury perfumery
              — without the luxury price tag.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Each bottle is an Extrait de Parfum — the highest concentration available — ensuring your scent lasts
              from morning to night. We believe that smelling exceptional should be a daily pleasure, not a rare occasion.
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
              Explore Our Collection
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
