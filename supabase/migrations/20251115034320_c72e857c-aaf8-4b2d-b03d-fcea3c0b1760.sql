-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role user_role,
  action text NOT NULL, -- INSERT, UPDATE, DELETE
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX idx_admin_audit_log_table_name ON public.admin_audit_log(table_name);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and developers can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_log
FOR SELECT
USING (get_current_user_role() IN ('admin', 'developer'));

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role user_role;
  audit_record_id uuid;
BEGIN
  -- Get the current user's role
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Only log if user is admin or developer
  IF current_user_role NOT IN ('admin', 'developer') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Determine the record ID
  IF TG_OP = 'DELETE' THEN
    audit_record_id := OLD.id;
  ELSE
    audit_record_id := NEW.id;
  END IF;
  
  -- Insert audit log entry
  INSERT INTO public.admin_audit_log (
    user_id,
    user_role,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    current_user_role,
    TG_OP,
    TG_TABLE_NAME,
    audit_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for users table
CREATE TRIGGER audit_users_insert
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_users_update
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_users_delete
AFTER DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Create triggers for orders table
CREATE TRIGGER audit_orders_insert
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_orders_update
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_orders_delete
AFTER DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Create triggers for integration_settings table
CREATE TRIGGER audit_integration_settings_insert
AFTER INSERT ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_integration_settings_update
AFTER UPDATE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_integration_settings_delete
AFTER DELETE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Add comments for documentation
COMMENT ON TABLE public.admin_audit_log IS 'Comprehensive audit log tracking all admin actions on sensitive tables';
COMMENT ON FUNCTION public.log_admin_action() IS 'Trigger function to automatically log admin actions with timestamps and changed values';