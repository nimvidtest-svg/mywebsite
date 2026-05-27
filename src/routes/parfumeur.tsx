import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, FlaskConical, Package, CheckCircle2, Truck, Star } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsapp } from "@/components/site/FloatingWhatsapp";
import { openWhatsapp } from "@/lib/whatsapp";
import collectionImg from "@/assets/collection.png";
import huileImg from "@/assets/huile de parfum.png";
import bouteilleImg from "@/assets/boutielle vide.png";
import offerImg from "@/assets/offer-3parfums.jpeg";

export const Route = createFileRoute("/parfumeur")({
  component: ParfumeurPage,
  head: () => ({
    meta: [{ title: "Devenir Parfumeur — Unique Parfum" }],
  }),
});

const HUILES = [
  { volume: "10ml", price: 30 },
  { volume: "30ml", price: 70 },
  { volume: "50ml", price: 110 },
  { volume: "100ml", price: 200 },
];

const BOUTEILLES = [
  { label: "Flacon 30ml", price: 15 },
  { label: "Flacon 50ml", price: 20 },
  { label: "Flacon 100ml", price: 30 },
];

const AVANTAGES = [
  { icon: FlaskConical, title: "Huiles de parfum pures", desc: "Concentrées et longue tenue, inspirées des plus grandes maisons." },
  { icon: Package, title: "Bouteilles vides premium", desc: "Flacons élégants prêts à être remplis et offerts ou revendus." },
  { icon: Truck, title: "Livraison rapide", desc: "Livraison partout au Maroc. Frais selon votre ville." },
  { icon: Star, title: "Qualité garantie", desc: "Mêmes huiles que nos parfums, disponibles en vrac." },
];

function ParfumeurPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <main className="container mx-auto px-6 py-24 md:py-32">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-center mb-24"
        >
          <div>
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs tracking-[0.2em] text-primary uppercase">Créez votre parfum</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 leading-tight">
              Devenir <span className="shimmer-text italic">Parfumeur</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Composez votre propre fragrance ou revendez nos huiles de parfum et flacons vides de qualité premium.
            </p>
          </div>
          <div className="relative glass gold-border rounded-3xl overflow-hidden bg-black flex items-center justify-center h-[320px] md:h-[400px]">
            <img
              src={collectionImg}
              alt="Collection Unique Parfum"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </motion.div>

        {/* Avantages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {AVANTAGES.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass gold-border rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                <a.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg mb-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Huile de Parfum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-0 glass gold-border rounded-3xl overflow-hidden mb-12"
        >
          <div className="bg-black flex items-center justify-center h-[280px] md:h-auto">
            <img
              src={huileImg}
              alt="Huile de Parfum"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl">Huile de Parfum</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Huiles concentrées inspirées des plus grandes marques mondiales. Parfaites pour créer vos propres flacons ou les revendre.
            </p>
            <div className="space-y-3 mb-8">
              {HUILES.map((h) => (
                <div key={h.volume} className="flex items-center justify-between px-4 py-3 rounded-xl glass border border-primary/20">
                  <span className="font-medium text-foreground">{h.volume}</span>
                  <span className="font-display text-xl text-gradient-gold">{h.price} <span className="text-sm text-muted-foreground font-sans">DH</span></span>
                </div>
              ))}
            </div>
            <button
              onClick={() => openWhatsapp("Bonjour, je suis intéressé(e) par les huiles de parfum. Pouvez-vous m'en dire plus ?")}
              className="w-full py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.02] transition-transform"
            >
              Commander via WhatsApp
            </button>
          </div>
        </motion.div>

        {/* Bouteille Vide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-0 glass gold-border rounded-3xl overflow-hidden mb-24"
        >
          <div className="p-8 md:p-10 flex flex-col justify-center order-2 md:order-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl">Bouteille Vide</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Flacons vides élégants et de qualité premium. Remplissez-les avec nos huiles et créez votre propre marque.
            </p>
            <div className="space-y-3 mb-8">
              {BOUTEILLES.map((b) => (
                <div key={b.label} className="flex items-center justify-between px-4 py-3 rounded-xl glass border border-primary/20">
                  <span className="font-medium text-foreground">{b.label}</span>
                  <span className="font-display text-xl text-gradient-gold">{b.price} <span className="text-sm text-muted-foreground font-sans">DH</span></span>
                </div>
              ))}
            </div>
            <button
              onClick={() => openWhatsapp("Bonjour, je suis intéressé(e) par les bouteilles vides. Pouvez-vous m'en dire plus ?")}
              className="w-full py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.02] transition-transform"
            >
              Commander via WhatsApp
            </button>
          </div>
          <div className="bg-black flex items-center justify-center h-[280px] md:h-auto order-1 md:order-2">
            <img
              src={bouteilleImg}
              alt="Bouteille Vide"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative glass gold-border rounded-3xl overflow-hidden"
        >
          <img
            src={offerImg}
            alt="Contactez-nous"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 text-center p-10 md:p-16">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-3xl md:text-4xl mb-3">Une question ? Un devis ?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Contactez-nous directement sur WhatsApp pour des commandes en gros ou des renseignements personnalisés.
            </p>
            <button
              onClick={() => openWhatsapp("Bonjour, je souhaite des informations sur les huiles de parfum et bouteilles vides.")}
              className="px-10 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.02] transition-transform"
            >
              Nous contacter
            </button>
          </div>
        </motion.div>

      </main>
      <Footer />
      <FloatingWhatsapp />
    </div>
  );
}
