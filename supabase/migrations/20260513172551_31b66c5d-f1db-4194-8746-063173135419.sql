
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY "Orders public insert" ON public.orders;
CREATE POLICY "Orders public insert" ON public.orders FOR INSERT
  WITH CHECK (
    char_length(customer_name) BETWEEN 1 AND 200
    AND char_length(phone) BETWEEN 4 AND 40
    AND jsonb_typeof(items) = 'array'
  );
