import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Hero } from "@/components/site/Hero";
import { TrustBadges } from "@/components/site/TrustBadges";
import { SpecialOffer } from "@/components/site/SpecialOffer";
import { About } from "@/components/site/About";
import { Catalogue } from "@/components/site/Catalogue";
import { Reviews } from "@/components/site/Reviews";
import { OrderForm } from "@/components/site/OrderForm";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsapp } from "@/components/site/FloatingWhatsapp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Unique Parfum — Fragrances inspirées à 50 DH" },
      { name: "description", content: "Maison marocaine de parfums inspirés des plus grandes marques. Livraison gratuite, paiement à la livraison, testeur offert." },
      { property: "og:title", content: "Unique Parfum — Maison de parfum" },
      { property: "og:description", content: "Des fragrances inspirées des plus grandes marques à 50 DH." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <SpecialOffer />
        <About />
        <Catalogue />
        <Reviews />
        <OrderForm />
      </main>
      <Footer />
      <FloatingWhatsapp />
    </div>
  );
}
