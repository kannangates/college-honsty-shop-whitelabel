import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Starting table stats update...');

    // Get table statistics from information_schema
    const { data: tableStats, error: statsError } = await supabaseClient
      .rpc('get_table_info');

    if (statsError) {
      throw new Error(`Failed to get table stats: ${statsError.message}`);
    }
        // Validate optional query parameters
        const url = new URL(req.url);
        const refreshParam = url.searchParams.get('refresh');
    
        const refreshSchema = z.enum(['true', 'false']).optional();
        const refreshValidation = refreshSchema.safeParse(refreshParam);
    
        if (!refreshValidation.success) {
          return new Response(
            JSON.stringify({
              error: 'Invalid refresh parameter',
              details: refreshValidation.error.issues.map(e => ({ field: 'refresh', message: e.message }))
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

    console.log(`✅ Table stats updated successfully. Found ${tableStats?.length || 0} tables.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Table stats updated',
        tables: tableStats?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error updating table stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
