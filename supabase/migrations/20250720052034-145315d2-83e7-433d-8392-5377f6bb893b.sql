-- Enable RLS on tables that need it
ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_cooldowns ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for n8n_webhooks (admin/developer only)
CREATE POLICY "Admins can manage n8n webhooks" 
ON public.n8n_webhooks 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add RLS policies for gamification_event_logs (users can view their own logs, admins can view all)
CREATE POLICY "Users can view their own gamification logs" 
ON public.gamification_event_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all gamification logs" 
ON public.gamification_event_logs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add RLS policies for gamification_rules (public read, admin manage)
CREATE POLICY "Anyone can view gamification rules" 
ON public.gamification_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gamification rules" 
ON public.gamification_rules 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add RLS policies for rule_cooldowns (users can view their own, system can manage)
CREATE POLICY "Users can view their own rule cooldowns" 
ON public.rule_cooldowns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rule cooldowns" 
ON public.rule_cooldowns 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add RLS policies for daily_stock_operations (admins only)
CREATE POLICY "Admins can manage daily stock operations" 
ON public.daily_stock_operations 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add RLS policies for integration_settings (admins only)
CREATE POLICY "Admins can manage integration settings" 
ON public.integration_settings 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add warehouse_stock column to daily_stock_operations if it doesn't exist
ALTER TABLE public.daily_stock_operations 
ADD COLUMN IF NOT EXISTS warehouse_stock integer DEFAULT 0;