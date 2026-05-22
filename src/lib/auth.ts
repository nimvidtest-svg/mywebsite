import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "mohamed2026@gmail.com";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    loading,
    email,
    isAuthenticated: !!email,
    isAdmin: !!email && email.toLowerCase() === ADMIN_EMAIL,
    signOut: () => supabase.auth.signOut(),
  };
}
