import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Tag, User, Sparkles, Star, Minus, Plus, CheckCircle2 } from "lucide-react";
import { fetchPerfumes, createOrder, type Perfume } from "@/lib/api";
import { Navbar } from "@/components/site/Navbar";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsapp } from "@/components/site/FloatingWhatsapp";

export const Route = createFileRoute("/parfum/$id")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.id} — Unique Parfum` }],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();

  const { data: perfumes = [], isLoading } = useQuery({
    queryKey: ["perfumes"],
    queryFn: fetchPerfumes,
  });

  const perfume = perfumes.find((p) => p.id === id);
  const related = perfumes
    .filter((p) => p.category === perfume?.category && p.id !== id)
    .slice(0, 4);

  if (!isLoading && !perfume) throw notFound();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <main className="container mx-auto px-6 py-16 md:py-24">
        <Link
          to="/"
          hash="catalogue"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        {isLoading ? (
          <ProductSkeleton />
        ) : perfume ? (
          <>
            <ProductDetail perfume={perfume} />
            {related.length > 0 && <RelatedProducts perfumes={related} />}
          </>
        ) : null}
      </main>
      <Footer />
      <FloatingWhatsapp />
    </div>
  );
}

const SIZES = [
  { label: "50ml", price: 50 },
  { label: "70ml", price: 70 },
];
const STAR_RATING = 5;

function ProductDetail({ perfume }: { perfume: Perfume }) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(SIZES[0]);
  const [form, setForm] = useState({ name: "", address: "", phone: "", city: "" });
  const [submitted, setSubmitted] = useState(false);

  const out = perfume.stock_status === "out_of_stock";
  const low = perfume.stock_status === "low_stock";

  const unitPrice = size.price;
  const totalPrice = unitPrice * qty;

  const handleQty = (delta: number) => setQty((q) => Math.max(1, Math.min(99, q + delta)));

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city || !form.address) return;
    createOrder({
      customer_name: form.name,
      phone: form.phone,
      city: form.city,
      address: form.address,
      items: [{ name: perfume.name, qty }],
      total: totalPrice,
      type: "standard",
      notes: `Taille: ${size.label}`,
    }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start mb-20"
      >
        {/* Image */}
        <div className="relative glass gold-border rounded-3xl bg-black overflow-hidden flex items-center justify-center h-[320px] md:h-[420px]">
          <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5 items-start">
            {perfume.best_seller && (
              <div className="bg-gradient-gold text-primary-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                Best Seller
              </div>
            )}
            {out && (
              <div className="bg-destructive/90 text-destructive-foreground text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                Rupture de stock
              </div>
            )}
            {low && !out && (
              <div className="bg-amber-500/90 text-black text-[10px] tracking-widest px-3 py-1 rounded-full font-medium uppercase">
                Stock limité
              </div>
            )}
          </div>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            src={perfume.image_url}
            alt={perfume.name}
            className="w-full h-full object-contain p-8 drop-shadow-xl animate-float hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Détails */}
        <div className="flex flex-col">
          <p className="text-[11px] tracking-[0.3em] text-primary uppercase mb-3">{perfume.brand}</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-3 leading-tight">{perfume.name}</h1>

          {/* Note */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.floor(STAR_RATING) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">5.0 · 24 avis</span>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-6">{perfume.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
              <Tag className="w-3 h-3 text-primary" />{perfume.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
              <User className="w-3 h-3 text-primary" />{perfume.gender}
            </span>
            {perfume.scent && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary" />{perfume.scent}
              </span>
            )}
            <span className="px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
              Longue tenue
            </span>
          </div>

          {/* Taille */}
          <div className="mb-5">
            <p className="text-xs tracking-widest uppercase text-primary mb-2">Taille</p>
            <div className="flex gap-3">
              {SIZES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition ${
                    size.label === s.label
                      ? "bg-gradient-gold text-primary-foreground border-transparent shadow-gold"
                      : "glass border-primary/30 text-foreground/70 hover:border-primary/60"
                  }`}
                >
                  {s.label} — {s.price} DH
                </button>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-6xl text-gradient-gold">{totalPrice}</span>
            <span className="text-2xl text-muted-foreground">DH</span>
            {qty > 1 && <span className="text-sm text-muted-foreground">({unitPrice} × {qty})</span>}
          </div>

          {/* Quantité */}
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase text-primary mb-2">Quantité</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQty(-1)}
                disabled={qty <= 1}
                className="w-10 h-10 rounded-full glass border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display text-2xl w-8 text-center">{qty}</span>
              <button
                type="button"
                onClick={() => handleQty(1)}
                disabled={qty >= 99}
                className="w-10 h-10 rounded-full glass border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Formulaire de commande intégré */}
          <div className="pt-6 border-t border-primary/15">
            <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Commande Directe</p>
            {submitted ? (
              <div className="py-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 glass gold-border rounded-2xl px-5 py-4">
                  <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-display text-xl text-foreground">Commande passée !</p>
                    <p className="text-sm text-muted-foreground mt-0.5">WhatsApp s'ouvre — notre équipe vous confirme sous peu.</p>
                  </div>
                </div>
                <Link
                  to="/"
                  hash="catalogue"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.02] transition text-sm"
                >
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <form onSubmit={submitForm} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <OrderField label="Nom complet" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Ahmed Benali" />
                  <OrderField label="Téléphone" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+212 6XX XXX XXX" />
                  <OrderField label="Ville" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="Casablanca" />
                  <OrderField label="Adresse" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} placeholder="123 Rue Hassan II" />
                </div>
                <button
                  type="submit"
                  disabled={out || !form.name || !form.phone || !form.city || !form.address}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  Confirmer la commande · {totalPrice} DH
                </button>
              </form>
            )}
          </div>

          {/* Composition */}
          <div className="mt-6 pt-6 border-t border-primary/15">
            <h3 className="text-sm font-medium tracking-widest uppercase text-primary mb-3">Composition</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Alcool denat., Parfum (Fragrance), Aqua (Water), Benzyl Benzoate, Linalool, Citronellol, Geraniol,
              Limonene, Eugenol, Benzyl Salicylate, Coumarin.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function OrderField({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-primary mb-2">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary/40 border border-primary/20 rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/60"
      />
    </div>
  );
}

function RelatedProducts({ perfumes }: { perfumes: Perfume[] }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-3xl md:text-4xl mb-8">
        Vous aimerez aussi
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {perfumes.map((p) => (
          <Link key={p.id} to="/parfum/$id" params={{ id: p.id }} className="group glass gold-border rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
            <div className="bg-black p-4 flex items-center justify-center h-40">
              <img
                src={p.image_url}
                alt={p.name}
                className="h-full object-contain drop-shadow group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-0.5">{p.brand}</p>
              <p className="font-display text-lg leading-tight">{p.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{p.price} DH</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-12 animate-pulse">
      <div className="glass gold-border rounded-3xl min-h-[420px] bg-white/10" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 bg-primary/20 rounded-full" />
        <div className="h-14 w-3/4 bg-foreground/10 rounded-xl" />
        <div className="h-4 w-full bg-foreground/10 rounded-full" />
        <div className="h-4 w-5/6 bg-foreground/10 rounded-full" />
        <div className="h-16 w-1/3 bg-primary/20 rounded-xl mt-4" />
        <div className="h-14 w-full bg-foreground/10 rounded-full mt-4" />
      </div>
    </div>
  );
}
