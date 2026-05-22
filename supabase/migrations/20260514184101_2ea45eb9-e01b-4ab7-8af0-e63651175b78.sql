-- Perfume extensions
ALTER TABLE public.perfumes
  ADD COLUMN IF NOT EXISTS scent text NOT NULL DEFAULT 'frais',
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock';

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfume_id uuid REFERENCES public.perfumes(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews public read approved" ON public.reviews
  FOR SELECT USING (approved = true OR is_admin());

CREATE POLICY "Reviews public insert" ON public.reviews
  FOR INSERT WITH CHECK (
    char_length(customer_name) BETWEEN 1 AND 80
    AND char_length(comment) <= 1000
    AND rating BETWEEN 1 AND 5
  );

CREATE POLICY "Reviews admin write" ON public.reviews
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Reviews admin delete" ON public.reviews
  FOR DELETE USING (is_admin());

-- Migrate order statuses to French
UPDATE public.orders SET status = 'nouveau' WHERE status IN ('new');
UPDATE public.orders SET status = 'confirme' WHERE status IN ('processing','confirmed');
UPDATE public.orders SET status = 'livre' WHERE status IN ('done','delivered');
UPDATE public.orders SET status = 'annule' WHERE status IN ('cancelled','canceled');
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'nouveau';