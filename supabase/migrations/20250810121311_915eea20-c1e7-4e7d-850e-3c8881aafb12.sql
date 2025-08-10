-- Fix ambiguous column references in adjust_product_stock by renaming INTO variables
CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id uuid,
  p_delta_shelf integer,
  p_delta_warehouse integer,
  p_reason text DEFAULT NULL::text,
  p_order_id uuid DEFAULT NULL::uuid,
  p_actor_user_id uuid DEFAULT NULL::uuid,
  p_adjust_opening boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  shelf_stock integer,
  warehouse_stock integer,
  opening_stock integer,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cur_shelf integer;
  v_cur_warehouse integer;
  v_cur_opening integer;
  v_new_shelf integer;
  v_new_warehouse integer;
  v_new_opening integer;
  v_ret_id uuid;
  v_ret_shelf integer;
  v_ret_warehouse integer;
  v_ret_opening integer;
  v_ret_updated timestamptz;
BEGIN
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'Product id is required';
  END IF;

  IF COALESCE(p_delta_shelf,0) = 0 AND COALESCE(p_delta_warehouse,0) = 0 THEN
    RAISE EXCEPTION 'At least one of delta_shelf or delta_warehouse must be non-zero';
  END IF;

  -- Only admins/developers can call this direct adjust function
  IF NOT (public.has_role(auth.uid(), 'admin'::user_role) OR public.has_role(auth.uid(), 'developer'::user_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(shelf_stock,0), COALESCE(warehouse_stock,0), COALESCE(opening_stock,0)
  INTO v_cur_shelf, v_cur_warehouse, v_cur_opening
  FROM public.products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  v_new_shelf := v_cur_shelf + COALESCE(p_delta_shelf,0);
  v_new_warehouse := v_cur_warehouse + COALESCE(p_delta_warehouse,0);
  v_new_opening := v_cur_opening + (
    CASE WHEN p_adjust_opening AND COALESCE(p_delta_warehouse,0) > 0 THEN COALESCE(p_delta_warehouse,0) ELSE 0 END
  );

  IF v_new_shelf < 0 THEN
    RAISE EXCEPTION 'Insufficient shelf stock for this operation';
  END IF;
  IF v_new_warehouse < 0 THEN
    RAISE EXCEPTION 'Insufficient warehouse stock for this operation';
  END IF;

  UPDATE public.products AS p
  SET
    shelf_stock = v_new_shelf,
    warehouse_stock = v_new_warehouse,
    opening_stock = v_new_opening,
    updated_at = now()
  WHERE p.id = p_product_id
  RETURNING p.id, p.shelf_stock, p.warehouse_stock, p.opening_stock, p.updated_at
  INTO v_ret_id, v_ret_shelf, v_ret_warehouse, v_ret_opening, v_ret_updated;

  -- Set return values
  id := v_ret_id;
  shelf_stock := v_ret_shelf;
  warehouse_stock := v_ret_warehouse;
  opening_stock := v_ret_opening;
  updated_at := v_ret_updated;

  -- Audit log (security definer will insert regardless of RLS; if you want RLS to apply, add an INSERT policy)
  INSERT INTO public.stock_movements (product_id, delta_shelf, delta_warehouse, reason, order_id, created_by)
  VALUES (p_product_id, COALESCE(p_delta_shelf,0), COALESCE(p_delta_warehouse,0), p_reason, p_order_id, COALESCE(p_actor_user_id, auth.uid()));

  RETURN NEXT;
END;
$function$;