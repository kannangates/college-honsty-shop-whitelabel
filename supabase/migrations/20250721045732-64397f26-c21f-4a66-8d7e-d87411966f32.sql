-- Drop existing policies that conflict and recreate them
DROP POLICY IF EXISTS "Admins can manage n8n webhooks" ON public.n8n_webhooks;
DROP POLICY IF EXISTS "Users can view their own gamification logs" ON public.gamification_event_logs;
DROP POLICY IF EXISTS "Admins can view all gamification logs" ON public.gamification_event_logs;
DROP POLICY IF EXISTS "Anyone can view gamification rules" ON public.gamification_rules;
DROP POLICY IF EXISTS "Admins can manage gamification rules" ON public.gamification_rules;
DROP POLICY IF EXISTS "Users can view their own rule cooldowns" ON public.rule_cooldowns;
DROP POLICY IF EXISTS "System can manage rule cooldowns" ON public.rule_cooldowns;
DROP POLICY IF EXISTS "Admins can manage daily stock operations" ON public.daily_stock_operations;
DROP POLICY IF EXISTS "Admins can manage integration settings" ON public.integration_settings;

-- Enable RLS on tables that need it
ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_cooldowns ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Admins can manage n8n webhooks" 
ON public.n8n_webhooks 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

CREATE POLICY "Users can view their own gamification logs" 
ON public.gamification_event_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all gamification logs" 
ON public.gamification_event_logs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

CREATE POLICY "Anyone can view gamification rules" 
ON public.gamification_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gamification rules" 
ON public.gamification_rules 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

CREATE POLICY "Users can view their own rule cooldowns" 
ON public.rule_cooldowns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rule cooldowns" 
ON public.rule_cooldowns 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

CREATE POLICY "Admins can manage daily stock operations" 
ON public.daily_stock_operations 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

CREATE POLICY "Admins can manage integration settings" 
ON public.integration_settings 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'developer'::user_role]));

-- Add warehouse_stock column to daily_stock_operations if it doesn't exist
ALTER TABLE public.daily_stock_operations 
ADD COLUMN IF NOT EXISTS warehouse_stock integer DEFAULT 0;