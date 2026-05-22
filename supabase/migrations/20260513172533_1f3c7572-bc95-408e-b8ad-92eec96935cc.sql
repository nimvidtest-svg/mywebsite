
-- Admin email whitelist + helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND lower(email) = 'mohamed2026@gmail.com'
  );
$$;

-- Perfumes
CREATE TABLE public.perfumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL CHECK (category IN ('FEMMES','HOMMES','NICHE','BEST SELLERS')),
  gender text NOT NULL CHECK (gender IN ('Femme','Homme','Mixte')),
  price numeric NOT NULL DEFAULT 50,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  best_seller boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfumes public read" ON public.perfumes FOR SELECT USING (true);
CREATE POLICY "Perfumes admin write" ON public.perfumes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings (key/value JSON)
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings admin write" ON public.settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  city text,
  address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric,
  type text NOT NULL DEFAULT 'standard',
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders public insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders admin read" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Orders admin update" ON public.orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Orders admin delete" ON public.orders FOR DELETE USING (public.is_admin());

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER perfumes_touch BEFORE UPDATE ON public.perfumes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket for perfume images
INSERT INTO storage.buckets (id, name, public) VALUES ('perfume-images', 'perfume-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Perfume images public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'perfume-images');
CREATE POLICY "Perfume images admin write"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'perfume-images' AND public.is_admin());
CREATE POLICY "Perfume images admin update"
  ON storage.objects FOR UPDATE USING (bucket_id = 'perfume-images' AND public.is_admin());
CREATE POLICY "Perfume images admin delete"
  ON storage.objects FOR DELETE USING (bucket_id = 'perfume-images' AND public.is_admin());
