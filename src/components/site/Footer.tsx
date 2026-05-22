import { Instagram, MessageCircle, Music2, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { openWhatsapp } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="relative border-t border-primary/15 pt-16 pb-8 mt-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src={logo} alt="Unique Parfum" className="h-16 mb-4" style={{filter: "invert(1) sepia(1) saturate(5) hue-rotate(5deg) brightness(0.9)"}} />
            <p className="text-sm text-muted-foreground max-w-xs">
              Maison de parfum marocaine. Des fragrances inspirées des plus grandes marques, à 50 DH seulement.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3"><MessageCircle className="w-4 h-4 text-primary"/>+212 701 778 254</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary"/>contact@uniqueparfum.ma</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary"/>Maroc · Livraison nationale</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Suivez-nous</h4>
            <div className="flex gap-3">
              {[
                { Icon: MessageCircle, onClick: () => openWhatsapp("Bonjour Unique Parfum"), href: undefined as string | undefined },
                { Icon: Instagram, href: "https://instagram.com", onClick: undefined },
                { Icon: Music2, href: "https://tiktok.com", onClick: undefined },
              ].map(({ Icon, href, onClick }, i) =>
                onClick ? (
                  <button key={i} type="button" onClick={onClick}
                    className="w-11 h-11 rounded-full glass-gold flex items-center justify-center text-primary hover:bg-gradient-gold hover:text-primary-foreground transition">
                    <Icon className="w-5 h-5"/>
                  </button>
                ) : (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                     className="w-11 h-11 rounded-full glass-gold flex items-center justify-center text-primary hover:bg-gradient-gold hover:text-primary-foreground transition">
                    <Icon className="w-5 h-5"/>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-primary/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Unique Parfum. Tous droits réservés.</p>
          <p className="font-display italic text-primary/70">Extrait de Parfum · Paris</p>
        </div>
      </div>
    </footer>
  );
}
