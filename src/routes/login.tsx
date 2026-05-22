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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
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
        <p className="text-sm text-muted-foreground mb-6">Connectez-vous pour gérer le catalogue.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Mot de passe</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-primary transition">
            {mode === "signin" ? "Première connexion ? Créer le compte admin" : "J'ai déjà un compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
