import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function triggerN8nWebhook(type: 'points' | 'badge' | 'notification' | 'analytics', payload: Record<string, unknown>) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 1. Fetch webhook URL from DB
  const { data, error } = await supabase
    .from('n8n_webhooks')
    .select('url')
    .eq('type', type)
    .single();

  if (error || !data?.url) {
    console.error(`No webhook URL found for type: ${type}`);
    return;
  }

  // 2. POST to webhook
  let status = 'success';
  let last_error = null;
  try {
    const res = await fetch(data.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      status = 'error';
      last_error = await res.text();
    }
  } catch (e) {
    status = 'error';
    last_error = (e instanceof Error ? e.message : String(e));
  }

  // 3. Log result in DB
  await supabase
    .from('n8n_webhooks')
    .update({
      last_status: status,
      last_called_at: new Date().toISOString(),
      last_error,
      updated_at: new Date().toISOString()
    })
    .eq('type', type);
} 