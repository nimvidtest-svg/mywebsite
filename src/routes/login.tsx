import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion · Unique Parfum" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate({ to: "/admin" });
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md glass gold-border rounded-3xl p-8">
        <Link to="/" className="text-xs tracking-[0.3em] text-primary uppercase">← Retour</Link>
        <h1 className="font-display text-4xl mt-4 mb-2">
          <span className="shimmer-text italic">Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Entrez le mot de passe admin.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.15em] text-primary uppercase mb-1.5 block">Mot de passe</label>
            <input required type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(false); }}
              className="w-full px-4 py-3 rounded-xl bg-noir border border-primary/20 text-foreground focus:border-primary focus:outline-none" />
          </div>
          {err && <p className="text-sm text-destructive">Mot de passe incorrect.</p>}
          <button type="submit"
            className="w-full py-3 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-gold flex items-center justify-center">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
