
-- 1) Drop order-based stock change function (depends on adjust_product_stock)
DROP FUNCTION IF EXISTS public.apply_order_stock_change(p_order_id uuid, p_action text, p_actor_user_id uuid);

-- 2) Drop core stock adjustment function used for restock and shelf moves
DROP FUNCTION IF EXISTS public.adjust_product_stock(p_product_id uuid, p_delta_shelf integer, p_delta_warehouse integer, p_reason text, p_order_id uuid, p_actor_user_id uuid, p_adjust_opening boolean);
