import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Tag, User, Sparkles } from "lucide-react";
import { fetchPerfumes, type Perfume } from "@/lib/api";
import { openWhatsapp } from "@/lib/whatsapp";
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

function ProductDetail({ perfume }: { perfume: Perfume }) {
  const order = () =>
    openWhatsapp(
      `Bonjour Unique Parfum, je souhaite commander : ${perfume.name} (${perfume.brand}) - ${perfume.price} DH`
    );
  const out = perfume.stock_status === "out_of_stock";
  const low = perfume.stock_status === "low_stock";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24"
    >
      {/* Image */}
      <div className="relative glass gold-border rounded-3xl bg-black overflow-hidden flex items-center justify-center h-[280px] md:h-[360px]">
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
          className="w-full h-full object-cover drop-shadow-xl animate-float"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <p className="text-[11px] tracking-[0.3em] text-primary uppercase mb-3">
          {perfume.brand}
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-tight">
          {perfume.name}
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          {perfume.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
            <Tag className="w-3 h-3 text-primary" />
            {perfume.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
            <User className="w-3 h-3 text-primary" />
            {perfume.gender}
          </span>
          {perfume.scent && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
              {perfume.scent}
            </span>
          )}
          <span className="px-4 py-1.5 rounded-full glass text-xs text-foreground/70 border border-primary/20">
            Longue tenue
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-10">
          <span className="font-display text-6xl text-gradient-gold">{perfume.price}</span>
          <span className="text-2xl text-muted-foreground">DH</span>
        </div>

        <button
          type="button"
          onClick={order}
          disabled={out}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-full bg-gradient-gold text-primary-foreground font-medium text-lg shadow-gold hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <MessageCircle className="w-5 h-5" />
          {out ? "Indisponible" : "Commander sur WhatsApp"}
        </button>
      </div>
    </motion.div>
  );
}

function RelatedProducts({ perfumes }: { perfumes: Perfume[] }) {
  return (
    <section>
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
      <div className="glass gold-border rounded-3xl min-h-[480px] bg-white/10" />
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
