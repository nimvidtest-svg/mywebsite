import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion · Unique Parfum" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@admin.com",
        password,
      });
      if (error) throw new Error("Mot de passe incorrect.");
      navigate({ to: "/admin" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md glass gold-border rounded-3xl p-8">
        <Link to="/" className="text-xs tracking-[0.3em] text-primary uppercase">← Retour</Link>
        <h1 className="font-display text-4xl mt-4 mb-2">
          <span className="shimmer-text italic">Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Entrez le mot de passe pour accéder au panneau admin.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Mot de passe</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
