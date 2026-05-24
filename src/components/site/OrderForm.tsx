import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { fetchPerfumes, createOrder } from "@/lib/api";

const baseSchema = z.object({
  prenom:    z.string().trim().min(2).max(50),
  nom:       z.string().trim().min(2).max(50),
  ville:     z.string().trim().min(2).max(80),
  adresse:   z.string().trim().min(5).max(200),
  telephone: z.string().trim().min(8).max(20).regex(/^[0-9+\s().-]+$/),
  parfum:    z.string().min(1),
  quantite:  z.coerce.number().int().min(1).max(99),
});
type Errors = Partial<Record<keyof z.infer<typeof baseSchema>, string>>;

export function OrderForm() {
  const { data: perfumes = [] } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });
  const [form, setForm] = useState({
    nom: "", prenom: "", ville: "", adresse: "", telephone: "",
    parfum: "", quantite: 1 as number | string,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!form.parfum && perfumes[0]) setForm((f) => ({ ...f, parfum: perfumes[0].name }));
  }, [perfumes, form.parfum]);

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = baseSchema.safeParse(form);
    if (!result.success) {
      const fe: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    const d = result.data;
    const customer_name = `${d.prenom} ${d.nom}`.trim();
    const found = perfumes.find((p) => p.name === d.parfum);
    try {
      await createOrder({
        customer_name, phone: d.telephone, city: d.ville, address: d.adresse,
        items: [{ name: d.parfum, qty: d.quantite }],
        total: found ? found.price * d.quantite : null,
        type: "standard", notes: null,
      });
      setSubmitted(true);
    } catch (err) {
      alert("Erreur : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm({ nom: "", prenom: "", ville: "", adresse: "", telephone: "", parfum: perfumes[0]?.name ?? "", quantite: 1 });
  };

  return (
    <section id="commander" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-4">Commande Express</p>
          <h2 className="font-display text-5xl md:text-6xl mb-4">
            Passer <span className="italic text-gradient-gold">Commande</span>
          </h2>
          <p className="text-muted-foreground">Remplissez le formulaire et passez votre commande en un clic.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass gold-border rounded-3xl p-8 md:p-10">

          {submitted ? (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <div className="flex items-center gap-3 glass gold-border rounded-2xl px-6 py-5 w-full">
                <CheckCircle2 className="w-9 h-9 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-display text-xl">Commande passée !</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Notre équipe vous contacte très bientôt.</p>
                </div>
              </div>
              <button onClick={reset}
                className="w-full py-3.5 rounded-full glass border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10 transition">
                Passer une autre commande
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Prénom"    value={form.prenom}    onChange={handle("prenom")}    error={errors.prenom}    maxLength={50} />
                <Field label="Nom"       value={form.nom}       onChange={handle("nom")}       error={errors.nom}       maxLength={50} />
                <Field label="Ville"     value={form.ville}     onChange={handle("ville")}     error={errors.ville}     maxLength={80} />
                <Field label="Téléphone" type="tel" value={form.telephone} onChange={handle("telephone")} error={errors.telephone} maxLength={20} />
              </div>
              <Field label="Adresse" value={form.adresse} onChange={handle("adresse")} error={errors.adresse} maxLength={200} />
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs tracking-widest uppercase text-primary mb-2">Parfum choisi</label>
                  <select value={form.parfum} onChange={handle("parfum")}
                    className="w-full bg-secondary/40 border border-primary/20 rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/60">
                    {perfumes.map((p) => (<option key={p.id} value={p.name}>{p.name} — {p.brand}</option>))}
                  </select>
                  {errors.parfum && <p className="mt-2 text-xs text-destructive">{errors.parfum}</p>}
                </div>
                <Field label="Quantité" type="number" min={1} max={99} value={String(form.quantite)} onChange={handle("quantite")} error={errors.quantite} />
              </div>
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:scale-[1.01] transition mt-3">
                Commander
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-primary mb-2">{label}</label>
      <input {...props} aria-invalid={!!error}
        className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/60 ${error ? "border-destructive/70 focus:border-destructive" : "border-primary/20 focus:border-primary/60"}`} />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
