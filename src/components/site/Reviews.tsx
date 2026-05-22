import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { fetchReviews, submitReview, type Review } from "@/lib/api";

const fallback: Review[] = [
  { id: "1", perfume_id: null, customer_name: "Sara B.", rating: 5, comment: "Incroyable tenue ! Mon parfum dure toute la journée.", approved: true, created_at: "" },
  { id: "2", perfume_id: null, customer_name: "Yassine M.", rating: 5, comment: "Le parfum ressemble énormément à l'original. Service impeccable.", approved: true, created_at: "" },
  { id: "3", perfume_id: null, customer_name: "Imane K.", rating: 5, comment: "Qualité premium à petit prix. J'ai déjà commandé 3 fois !", approved: true, created_at: "" },
];

export function Reviews() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["reviews"], queryFn: fetchReviews });
  const list = data.length ? data : fallback;

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    setBusy(true);
    try {
      await submitReview({ customer_name: name, rating, comment });
      setSent(true); setName(""); setComment(""); setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setTimeout(() => setSent(false), 4000);
    } catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setBusy(false); }
  };

  return (
    <section id="avis" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
      <div className="container mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Témoignages</p>
          <h2 className="font-display text-5xl md:text-6xl">
            Ils nous font <span className="italic text-gradient-gold">confiance</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {list.slice(0, 6).map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}
              className="glass gold-border rounded-3xl p-7">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`w-4 h-4 ${k < r.rating ? "fill-primary text-primary" : "text-foreground/20"}`} />
                ))}
              </div>
              <p className="text-foreground/90 mb-6 font-display text-xl italic leading-relaxed">"{r.comment}"</p>
              <div className="text-sm font-medium text-foreground">{r.customer_name}</div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={send} className="max-w-xl mx-auto glass gold-border rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="font-display text-2xl text-center">Laissez votre avis</h3>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
                <Star className={`w-7 h-7 transition ${n <= rating ? "fill-primary text-primary" : "text-foreground/30"}`} />
              </button>
            ))}
          </div>
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom"
            className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 focus:border-primary focus:outline-none" />
          <textarea required maxLength={1000} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partagez votre expérience..."
            className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 focus:border-primary focus:outline-none resize-none" />
          <button type="submit" disabled={busy}
            className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> {sent ? "Merci !" : "Publier mon avis"}
          </button>
        </form>
      </div>
    </section>
  );
}
