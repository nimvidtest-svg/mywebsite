import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, Gift, Sparkles, Check, X, CheckCircle2 } from "lucide-react";
import offerImg from "@/assets/offer-3parfums.jpeg";
import { fetchPerfumes, fetchSetting, createOrder, type OfferSettings } from "@/lib/api";
import { openWhatsapp } from "@/lib/whatsapp";

export function SpecialOffer() {
  const [open, setOpen] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [ville, setVille] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tel, setTel] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });
  const { data: offer } = useQuery({
    queryKey: ["settings", "offer"],
    queryFn: () => fetchSetting<OfferSettings>("offer"),
  });

  const sorted = useMemo(
    () => [...perfumes].sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)),
    [perfumes]
  );

  const valid = p1 && p2 && p3 && nom && prenom && ville && adresse && tel;

  if (offer && offer.enabled === false) return null;

  const o: OfferSettings = offer ?? {
    enabled: true, badge: "Offre Spéciale", title1: "3 Parfums", title2: "Extrait de Parfum",
    price: 199, old_price_text: "au lieu de 299 DH",
    cta: "Choisir mes 3 parfums",
    features: ["Choisissez 3 parfums dans tout le catalogue", "1 testeur offert avec votre commande", "Livraison gratuite partout au Maroc"],
    image_url: "",
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    const customer_name = `${prenom} ${nom}`.trim();
    try {
      await createOrder({
        customer_name, phone: tel, city: ville, address: adresse,
        items: [{ name: p1 }, { name: p2 }, { name: p3 }],
        total: o.price, type: "offer_3", notes: "Offre 199 DH · testeur inclus",
      });
      const msg = `Bonjour, je voudrais l'offre 3 parfums :\n1. ${p1}\n2. ${p2}\n3. ${p3}\nTotal : ${o.price} DH\n\nNom : ${customer_name}\nTél : ${tel}\nVille : ${ville}\nAdresse : ${adresse}`;
      openWhatsapp(msg);
    } catch (err) { console.error(err); }
    setSubmitted(true);
  };

  return (
    <section id="offre" className="relative py-20 bg-noir overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden glass-gold border border-primary/30 shadow-gold">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            <div className="relative bg-noir">
              <img src={o.image_url || offerImg} alt={`Offre ${o.price} DH`} className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40 md:to-background/0" />
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-noir to-background">
              <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-5 self-start">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs tracking-[0.2em] text-primary uppercase">{o.badge}</span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-3">
                <span className="block text-foreground">{o.title1}</span>
                <span className="block shimmer-text italic">{o.title2}</span>
              </h2>

              <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 mb-5 self-start border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary tracking-widest">50ml · le flacon</span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-6xl md:text-7xl text-gradient-gold">{o.price}</span>
                <span className="text-2xl text-primary font-light">DH</span>
                {o.old_price_text && <span className="text-sm text-muted-foreground ml-2 line-through">{o.old_price_text}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {o.features.map((text, i) => {
                  const Icon = [Check, Gift, Truck][i % 3];
                  return (
                    <li key={i} className="flex items-start gap-3 text-foreground/90">
                      <span className="mt-0.5 w-7 h-7 rounded-full glass-gold flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="font-light">{text}</span>
                    </li>
                  );
                })}
              </ul>

              <button onClick={() => setOpen(true)}
                className="px-8 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.02] transition-transform self-start">
                {o.cta}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
            className="relative bg-background border border-primary/30 rounded-3xl max-w-2xl w-full my-8 shadow-gold">
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary/10 transition z-10" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 glass-gold rounded-full px-3 py-1 mb-3">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] tracking-[0.2em] text-primary uppercase">Offre {o.price} DH</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl"><span className="shimmer-text italic">Mes 3 parfums</span></h3>
                <p className="text-sm text-muted-foreground mt-2">Livraison gratuite + testeur offert</p>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="flex items-center gap-3 glass gold-border rounded-2xl px-6 py-5 w-full">
                    <CheckCircle2 className="w-9 h-9 text-primary flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-display text-xl">Commande passée !</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Notre équipe vous contacte très bientôt.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setOpen(false); setSubmitted(false); setP1(""); setP2(""); setP3(""); setNom(""); setPrenom(""); setVille(""); setAdresse(""); setTel(""); }}
                    className="w-full py-3.5 rounded-full glass border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10 transition">
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  {[
                    { label: "Parfum 1", value: p1, set: setP1 },
                    { label: "Parfum 2", value: p2, set: setP2 },
                    { label: "Parfum 3", value: p3, set: setP3 },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">{f.label}</label>
                      <select required value={f.value} onChange={(e) => f.set(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none transition">
                        <option value="">— Choisir un parfum —</option>
                        {sorted.map((p) => (
                          <option key={p.id} value={`${p.name} (${p.brand})`}>{p.brand} — {p.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Field label="Prénom" value={prenom} onChange={setPrenom} />
                    <Field label="Nom" value={nom} onChange={setNom} />
                    <Field label="Ville" value={ville} onChange={setVille} />
                    <Field label="Téléphone" value={tel} onChange={setTel} type="tel" />
                  </div>
                  <Field label="Adresse" value={adresse} onChange={setAdresse} />

                  <button type="submit" disabled={!valid}
                    className="w-full mt-2 px-8 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    Commander · {o.price} DH
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">{label}</label>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={120}
        className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none transition" />
    </div>
  );
}
