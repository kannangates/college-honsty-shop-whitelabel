-- Generate user-friendly order IDs by creating a function and trigger
CREATE OR REPLACE FUNCTION generate_friendly_order_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    prefix TEXT := 'ORD';
    counter INTEGER;
BEGIN
    -- Get the current count of orders + 1
    SELECT COUNT(*) + 1 INTO counter FROM orders;
    
    -- Format as ORD0001, ORD0002, etc.
    new_id := prefix || LPAD(counter::TEXT, 4, '0');
    
    -- Ensure uniqueness (in case of concurrent inserts)
    WHILE EXISTS (SELECT 1 FROM orders WHERE friendly_id = new_id) LOOP
        counter := counter + 1;
        new_id := prefix || LPAD(counter::TEXT, 4, '0');
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Add friendly_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS friendly_id TEXT UNIQUE;

-- Create trigger to auto-generate friendly IDs
CREATE OR REPLACE FUNCTION set_friendly_order_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.friendly_id IS NULL THEN
        NEW.friendly_id := generate_friendly_order_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_friendly_order_id ON orders;
CREATE TRIGGER trigger_set_friendly_order_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_friendly_order_id();

-- Update existing orders with friendly IDs using a temporary sequence
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM orders WHERE friendly_id IS NULL ORDER BY created_at LOOP
        UPDATE orders 
        SET friendly_id = 'ORD' || LPAD(counter::TEXT, 4, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;