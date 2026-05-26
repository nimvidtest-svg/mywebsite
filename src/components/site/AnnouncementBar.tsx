import { Truck, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-gradient-gold text-primary-foreground text-[11px] md:text-xs tracking-wider uppercase">
      <div className="container mx-auto px-4 py-1.5 flex items-center justify-center gap-2 md:gap-6 flex-wrap text-center">
        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Livraison gratuite partout au Maroc</span>
        <span className="opacity-50 hidden md:inline">·</span>
        <a href="/#offre" className="flex items-center gap-1.5 hover:underline font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Offre 3 parfums à 199 DH
        </a>
      </div>
    </div>
  );
}
