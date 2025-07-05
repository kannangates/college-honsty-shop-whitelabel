
-- Add recommended database indexes for performance (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users (student_id);
CREATE INDEX IF NOT EXISTS idx_users_department_shift ON public.users (department, shift);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON public.orders (user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON public.products USING gin (to_tsvector('english', name));
