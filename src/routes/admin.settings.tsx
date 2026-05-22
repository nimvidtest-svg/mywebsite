import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSetting, saveSetting, setCachedWa, type HeroSettings, type OfferSettings } from "@/lib/api";
import { Loader2, Save, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const qc = useQueryClient();
  const { data: wa } = useQuery({ queryKey: ["settings", "whatsapp_number"], queryFn: () => fetchSetting<string>("whatsapp_number") });
  const { data: hero } = useQuery({ queryKey: ["settings", "hero"], queryFn: () => fetchSetting<HeroSettings>("hero") });
  const { data: offer } = useQuery({ queryKey: ["settings", "offer"], queryFn: () => fetchSetting<OfferSettings>("offer") });

  const [waVal, setWaVal] = useState("");
  const [heroVal, setHeroVal] = useState<HeroSettings | null>(null);
  const [offerVal, setOfferVal] = useState<OfferSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { if (wa !== undefined) setWaVal(wa ?? ""); }, [wa]);
  useEffect(() => { if (hero) setHeroVal(hero); }, [hero]);
  useEffect(() => { if (offer) setOfferVal(offer); }, [offer]);

  const save = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      await saveSetting(key, value);
      if (key === "whatsapp_number") setCachedWa(String(value));
      qc.invalidateQueries({ queryKey: ["settings", key] });
      alert("Enregistré ✓");
    } catch (e) { alert(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(null); }
  };

  const uploadOfferImage = async (file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `offer-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("perfume-images").upload(path, file);
    if (error) { alert(error.message); return; }
    const { data: pub } = supabase.storage.from("perfume-images").getPublicUrl(path);
    setOfferVal((o) => o ? { ...o, image_url: pub.publicUrl } : o);
  };

  if (!heroVal || !offerVal) return <Loader2 className="w-6 h-6 animate-spin text-primary" />;

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="font-display text-3xl">Paramètres</h1>

      {/* WhatsApp */}
      <Card title="Numéro WhatsApp">
        <div className="flex gap-2">
          <input value={waVal} onChange={(e) => setWaVal(e.target.value)} placeholder="212701778254"
            className="flex-1 px-3 py-2 rounded-lg bg-noir border border-primary/20 focus:border-primary focus:outline-none" />
          <SaveBtn loading={saving === "whatsapp_number"} onClick={() => save("whatsapp_number", waVal)} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Sans + ni espaces. Ex: 212701778254</p>
      </Card>

      {/* Hero */}
      <Card title="Section Hero (page d'accueil)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Badge" value={heroVal.badge} onChange={(v) => setHeroVal({ ...heroVal, badge: v })} />
          <Field label="Titre 1" value={heroVal.title1} onChange={(v) => setHeroVal({ ...heroVal, title1: v })} />
          <Field label="Titre 2 (italique)" value={heroVal.title2} onChange={(v) => setHeroVal({ ...heroVal, title2: v })} />
          <Field label="Texte prix" value={heroVal.price_text} onChange={(v) => setHeroVal({ ...heroVal, price_text: v })} />
          <Field label="Bouton 1" value={heroVal.cta1} onChange={(v) => setHeroVal({ ...heroVal, cta1: v })} />
          <Field label="Bouton 2" value={heroVal.cta2} onChange={(v) => setHeroVal({ ...heroVal, cta2: v })} />
        </div>
        <Field label="Sous-titre" value={heroVal.subtitle} onChange={(v) => setHeroVal({ ...heroVal, subtitle: v })} />
        <SaveBtn loading={saving === "hero"} onClick={() => save("hero", heroVal)} />
      </Card>

      {/* Offer */}
      <Card title="Offre 199 DH (3 parfums)">
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={offerVal.enabled} onChange={(e) => setOfferVal({ ...offerVal, enabled: e.target.checked })} />
          Afficher l'offre sur la page d'accueil
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Badge" value={offerVal.badge} onChange={(v) => setOfferVal({ ...offerVal, badge: v })} />
          <Field label="CTA" value={offerVal.cta} onChange={(v) => setOfferVal({ ...offerVal, cta: v })} />
          <Field label="Titre 1" value={offerVal.title1} onChange={(v) => setOfferVal({ ...offerVal, title1: v })} />
          <Field label="Titre 2" value={offerVal.title2} onChange={(v) => setOfferVal({ ...offerVal, title2: v })} />
          <Field label="Prix (DH)" type="number" value={String(offerVal.price)} onChange={(v) => setOfferVal({ ...offerVal, price: Number(v) || 0 })} />
          <Field label="Ancien prix (texte)" value={offerVal.old_price_text} onChange={(v) => setOfferVal({ ...offerVal, old_price_text: v })} />
        </div>
        <div>
          <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Avantages (un par ligne)</label>
          <textarea rows={3} value={offerVal.features.join("\n")} onChange={(e) => setOfferVal({ ...offerVal, features: e.target.value.split("\n").filter(Boolean) })}
            className="w-full px-3 py-2 rounded-lg bg-noir border border-primary/20 focus:border-primary focus:outline-none" />
        </div>
        <div className="flex items-end gap-3">
          {offerVal.image_url && <img src={offerVal.image_url} alt="" className="h-20 w-20 object-cover rounded-lg border border-primary/20" />}
          <div className="flex-1">
            <Field label="URL Image" value={offerVal.image_url} onChange={(v) => setOfferVal({ ...offerVal, image_url: v })} />
            <label className="inline-flex items-center gap-2 px-3 py-2 mt-2 rounded-full glass-gold text-primary text-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Uploader
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadOfferImage(e.target.files[0])} />
            </label>
          </div>
        </div>
        <SaveBtn loading={saving === "offer"} onClick={() => save("offer", offerVal)} />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass gold-border rounded-2xl p-6 space-y-3">
      <h2 className="font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-noir border border-primary/20 focus:border-primary focus:outline-none" />
    </div>
  );
}
function SaveBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium shadow-gold disabled:opacity-50 flex items-center gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
    </button>
  );
}
