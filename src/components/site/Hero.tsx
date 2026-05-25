import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import bottle from "@/assets/hero-bottle.png";
import { Sparkles, Truck, Heart } from "lucide-react";

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 60, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noir" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center py-16">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] mb-6"
          >
            <span className="block shimmer-text italic font-light">L'art du parfum de qualité.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-3 font-light"
          >
            Des fragrances premium inspirées des plus grandes maisons de parfum du monde.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-3xl md:text-4xl text-gradient-gold mb-10"
          >
            À partir de 50 DH seulement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#catalogue" className="px-8 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-105 transition-transform">
              Découvrir
            </a>
            <a
              href="#commander"
              className="px-8 py-4 rounded-full glass-gold text-primary font-medium tracking-wide hover:bg-primary/10 transition"
            >
              Commander
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="grid grid-cols-3 gap-3 mt-12 max-w-xl"
          >
            {[
              { icon: Heart, label: "+100 clients", sub: "satisfaits" },
              { icon: Truck, label: "Livraison", sub: "rapide" },
              { icon: Sparkles, label: "Longue tenue", sub: "garantie" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200 }}
          className="relative h-[420px] sm:h-[520px] lg:h-[640px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-primary/5 to-transparent blur-3xl" />
          <motion.div
            className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[70%] h-10 rounded-[50%] bg-primary/30 blur-2xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scaleX: [0.9, 1.05, 0.9] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 h-full w-full flex items-center justify-center"
          >
            <img
              src={bottle}
              alt="Unique Parfum — Extrait de Parfum"
              className="relative h-full w-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.75)]"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/15 to-transparent mix-blend-overlay pointer-events-none"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
