-- Allow admins/developers to update products so restock operations can persist
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (
  get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role])
);

-- Ensure updated_at is maintained automatically on product updates
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();