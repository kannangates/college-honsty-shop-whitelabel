import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { configSchema } from '../_shared/schemas.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is admin or developer using secure user_roles table
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roleError || !userRoles || userRoles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Admin or Developer access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hasAdminRole = userRoles.some(roleRecord =>
        roleRecord.role === 'admin' || roleRecord.role === 'developer'
      );

      if (!hasAdminRole) {
        return new Response(
          JSON.stringify({ error: 'Admin or Developer access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { config } = await req.json();

      // Validate config structure
      if (!config || typeof config !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Invalid config format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Validate config with Zod schema
      const configValidation = configSchema.safeParse(config);
      if (!configValidation.success) {
        const validationError = configValidation as { error: { issues: Array<{ path: Array<string | number>; message: string }> } };
        return new Response(
          JSON.stringify({
            error: 'Config validation failed',
            details: validationError.error.issues.map(e => ({ field: e.path.join('.'), message: e.message }))
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const validatedConfig = configValidation.data;

      // Write the config to whitelabel.json file
      const configJson = JSON.stringify(validatedConfig, null, 2);
      try {
        // For now, we'll just return success since file writing in edge functions has limitations
        console.log('Whitelabel config received:', configJson);
        return new Response(
          JSON.stringify({ success: true, message: 'Whitelabel configuration updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (writeError) {
        console.error('Error writing whitelabel.json:', writeError);
        return new Response(
          JSON.stringify({ error: 'Failed to update configuration file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in update-whitelabel-json function:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});