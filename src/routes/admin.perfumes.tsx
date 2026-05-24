import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPerfumes, type Perfume, type Category, type Gender, type StockStatus, categories } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Loader2, Star, StarOff, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/perfumes")({ component: AdminPerfumes });

const empty: Omit<Perfume, "id"> = {
  name: "", brand: "", category: "FEMMES", gender: "Femme",
  price: 50, description: "", image_url: "", best_seller: false, sort_order: 0,
  scent: "frais", stock_status: "in_stock",
};

function AdminPerfumes() {
  const qc = useQueryClient();
  const { data: perfumes = [], isLoading } = useQuery({ queryKey: ["perfumes"], queryFn: fetchPerfumes });
  const [editing, setEditing] = useState<(Omit<Perfume, "id"> & { id?: string }) | null>(null);
  const [filter, setFilter] = useState("");

  const list = perfumes.filter((p) =>
    !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.brand.toLowerCase().includes(filter.toLowerCase())
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["perfumes"] });

  const save = async (data: Omit<Perfume, "id"> & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabase.from("perfumes").update(rest).eq("id", id);
      if (error) { alert(error.message); return; }
    } else {
      const { id: _i, ...rest } = data;
      void _i;
      const { error } = await supabase.from("perfumes").insert(rest);
      if (error) { alert(error.message); return; }
    }
    setEditing(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce parfum ?")) return;
    const { error } = await supabase.from("perfumes").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    refresh();
  };

  const toggleBest = async (p: Perfume) => {
    await supabase.from("perfumes").update({ best_seller: !p.best_seller }).eq("id", p.id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Parfums <span className="text-muted-foreground text-base">({perfumes.length})</span></h1>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm flex items-center gap-2 shadow-gold">
          <Plus className="w-4 h-4" /> Ajouter un parfum
        </button>
      </div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Rechercher..."
        className="w-full md:max-w-sm px-4 py-2 rounded-full bg-noir border border-primary/20 text-sm focus:outline-none focus:border-primary" />

      {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="glass gold-border rounded-2xl overflow-hidden flex flex-col">
              <div className="h-44 bg-gradient-to-br from-secondary/40 to-background flex items-center justify-center">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full object-contain p-2" /> : <span className="text-xs text-muted-foreground">Sans image</span>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] tracking-widest uppercase text-primary/80">{p.brand} · {p.gender} · {p.category}</p>
                <h3 className="font-display text-xl mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-display text-lg text-gradient-gold">{p.price} DH</span>
                  <div className="flex gap-1">
                    <button onClick={() => toggleBest(p)} title="Best seller"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition ${p.best_seller ? "bg-gradient-gold text-primary-foreground" : "glass text-foreground/60 hover:text-primary"}`}>
                      {p.best_seller ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditing(p)} className="w-8 h-8 rounded-full glass flex items-center justify-center hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-full glass flex items-center justify-center hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <PerfumeEditor data={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function PerfumeEditor({ data, onClose, onSave }: { data: Omit<Perfume, "id"> & { id?: string }; onClose: () => void; onSave: (d: Omit<Perfume, "id"> & { id?: string }) => Promise<void> }) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("perfume-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("perfume-images").getPublicUrl(path);
      set("image_url", pub.publicUrl);
    } catch (e) { alert(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-background border border-primary/30 rounded-3xl my-8 p-6 md:p-8 space-y-4 shadow-gold">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{form.id ? "Modifier" : "Nouveau parfum"}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom" value={form.name} onChange={(v) => set("name", v)} />
          <Input label="Marque" value={form.brand} onChange={(v) => set("brand", v)} />
          <Input label="Prix (DH)" type="number" value={String(form.price)} onChange={(v) => set("price", Number(v) || 0)} />
          <Select label="Stock" value={form.stock_status} onChange={(v) => set("stock_status", v as StockStatus)}
            options={["in_stock","low_stock","out_of_stock"]}
            labels={{ in_stock: "En stock", low_stock: "Stock limité", out_of_stock: "Rupture" }} />
          <Select label="Catégorie" value={form.category} onChange={(v) => set("category", v as Category)} options={categories} />
          <Select label="Genre" value={form.gender} onChange={(v) => set("gender", v as Gender)} options={["Femme", "Homme", "Mixte"]} />
        </div>

        {/* Image */}
        <div>
          <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Image</label>
          <div className="flex gap-3 items-center">
            {form.image_url && <img src={form.image_url} alt="" className="h-20 w-20 object-contain rounded-lg bg-noir border border-primary/20" />}
            <div className="flex-1 space-y-2">
              <input type="text" placeholder="URL de l'image" value={form.image_url} onChange={(e) => set("image_url", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-noir border border-primary/20 text-sm focus:outline-none focus:border-primary" />
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-gold text-primary text-xs cursor-pointer hover:bg-primary/10">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Uploader une image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">{label}</label>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-noir border border-primary/20 focus:border-primary focus:outline-none" />
    </div>
  );
}
function Select({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string,string> }) {
  return (
    <div>
      <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-noir border border-primary/20 focus:border-primary focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </div>
  );
}
