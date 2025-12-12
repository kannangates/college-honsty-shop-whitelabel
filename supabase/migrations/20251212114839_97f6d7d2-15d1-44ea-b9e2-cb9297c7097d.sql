
-- Fix trigger_update_product_rating function - add search_path
CREATE OR REPLACE FUNCTION public.trigger_update_product_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.rating IS NOT NULL THEN
            PERFORM update_product_rating(NEW.product_id);
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.rating IS NOT NULL THEN
            PERFORM update_product_rating(OLD.product_id);
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$function$;

-- Fix update_product_rating function - add search_path
CREATE OR REPLACE FUNCTION public.update_product_rating(product_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    avg_rating DECIMAL(3,2);
    total_ratings INTEGER;
BEGIN
    -- Calculate average rating and count for the product
    SELECT 
        COALESCE(AVG(rating::DECIMAL), 0.00),
        COUNT(rating)
    INTO avg_rating, total_ratings
    FROM order_items 
    WHERE product_id = product_id_param 
    AND rating IS NOT NULL;
    
    -- Update the products table
    UPDATE products 
    SET 
        average_rating = avg_rating,
        rating_count = total_ratings,
        updated_at = NOW()
    WHERE id = product_id_param;
END;
$function$;
