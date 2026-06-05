import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

// Using /#hash so links work from any page (product pages, etc.)
const links = [
  { href: "/#catalogue",  label: "Catalogue" },
  { href: "/parfumeur",   label: "Devenir Parfumeur" },
  { href: "/#about",      label: "À Propos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-7 md:top-8 inset-x-0 z-50 transition-all duration-500 bg-primary/10 backdrop-blur-md ${
        scrolled ? "py-1" : "py-2"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo — big at top, shrinks on scroll */}
        <a href="/" className="flex items-center gap-3">
          <motion.img
            src={logo}
            alt="Unique Parfum"
            animate={{ height: scrolled ? 68 : 110 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-auto"
            style={{ filter: "invert(1) sepia(1) saturate(5) hue-rotate(5deg) brightness(0.9)" }}
          />
          <motion.span
            animate={{ opacity: scrolled ? 0 : 1, x: scrolled ? -8 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-baseline gap-1.5 font-display tracking-wider pointer-events-none"
          >
            <span className="text-sm sm:text-xl text-gradient-gold">Unique Parfum</span>
            <span className="text-xs sm:text-base text-primary/80 italic">— Salé</span>
          </motion.span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="text-base tracking-wide text-primary hover:text-primary/70 transition-colors font-semibold">
              {l.label}
            </a>
          ))}
          <a href="/#commander"
            className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium shadow-gold hover:opacity-90 transition">
            Commander
          </a>
        </nav>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary" aria-label="Menu">
          <div className="w-6 h-0.5 bg-primary mb-1.5" />
          <div className="w-6 h-0.5 bg-primary mb-1.5" />
          <div className="w-4 h-0.5 bg-primary" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass mt-3 mx-6 rounded-2xl p-6 flex flex-col gap-4"
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-base text-primary hover:text-primary/70 transition-colors font-semibold">
              {l.label}
            </a>
          ))}
          <a href="/#commander" onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium shadow-gold text-center">
            Commander
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
