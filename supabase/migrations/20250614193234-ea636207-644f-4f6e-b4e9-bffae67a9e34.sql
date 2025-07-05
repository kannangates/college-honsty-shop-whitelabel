
-- Fix the get_todays_dashboard_stats function to resolve nested aggregate function error
CREATE OR REPLACE FUNCTION public.get_todays_dashboard_stats()
 RETURNS TABLE(
   todays_orders bigint,
   todays_paid_orders bigint,
   total_revenue numeric,
   todays_unique_customers bigint,
   todays_sold_products jsonb
 )
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  today_start timestamp with time zone;
BEGIN
  today_start := date_trunc('day', now());
  
  RETURN QUERY
  WITH today_orders AS (
    SELECT * FROM public.orders WHERE created_at >= today_start
  ),
  today_order_items AS (
    SELECT oi.*, o.payment_status, p.name as product_name
    FROM public.order_items oi
    JOIN today_orders o ON oi.order_id = o.id
    JOIN public.products p ON oi.product_id = p.id
  ),
  product_stats AS (
    SELECT 
      product_name,
      SUM(quantity) as total_quantity,
      SUM(CASE WHEN payment_status = 'paid' THEN quantity ELSE 0 END) as paid_quantity,
      SUM(CASE WHEN payment_status = 'unpaid' THEN quantity ELSE 0 END) as unpaid_quantity,
      SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) as paid_amount,
      SUM(CASE WHEN payment_status = 'unpaid' THEN total_price ELSE 0 END) as unpaid_amount
    FROM today_order_items
    GROUP BY product_name
    ORDER BY total_quantity DESC
  )
  SELECT
    -- Today's total orders
    (SELECT COUNT(*) FROM today_orders)::bigint,
    
    -- Today's paid orders
    (SELECT COUNT(*) FROM today_orders WHERE payment_status = 'paid')::bigint,
    
    -- Total revenue today
    (SELECT COALESCE(SUM(total_amount), 0) FROM today_orders WHERE payment_status = 'paid'),
    
    -- Today's unique customers
    (SELECT COUNT(DISTINCT user_id) FROM today_orders)::bigint,
    
    -- Today's sold products with counts
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'product_name', product_name,
        'total_quantity', total_quantity,
        'paid_quantity', paid_quantity,
        'unpaid_quantity', unpaid_quantity,
        'paid_amount', paid_amount,
        'unpaid_amount', unpaid_amount
      )
    ), '[]'::jsonb)
    FROM product_stats);
END;
$function$;
