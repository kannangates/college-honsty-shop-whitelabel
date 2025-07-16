import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export type GamificationEvent = {
  event_type: string;
  user_id: string;
  payload: Record<string, any>;
};

export async function handleGamificationEvent(event: GamificationEvent) {
  // 1. Fetch active rules for this event
  const { data: rules, error: rulesError } = await supabase
    .from('gamification_rules')
    .select('*')
    .eq('event_type', event.event_type)
    .eq('active', true);

  if (rulesError) throw rulesError;
  if (!rules) return;

  for (const rule of rules) {
    // 2. Check cooldown (optional)
    if (rule.cooldown_seconds) {
      const { data: recentLog } = await supabase
        .from('gamification_event_logs')
        .select('created_at')
        .eq('user_id', event.user_id)
        .eq('rule_id', rule.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (recentLog) {
        const last = new Date(recentLog.created_at).getTime();
        const now = Date.now();
        if ((now - last) / 1000 < rule.cooldown_seconds) continue;
      }
    }

    // 3. Evaluate condition
    let conditionsMet = false;
    const val = event.payload?.[rule.condition_type];
    const condVal = isNaN(Number(rule.condition_value)) ? rule.condition_value : Number(rule.condition_value);
    switch (rule.operator) {
      case '<=':
        conditionsMet = val <= condVal;
        break;
      case '>=':
        conditionsMet = val >= condVal;
        break;
      case '==':
        conditionsMet = val == condVal;
        break;
      case '<':
        conditionsMet = val < condVal;
        break;
      case '>':
        conditionsMet = val > condVal;
        break;
      default:
        conditionsMet = false;
    }
    if (!conditionsMet) continue;

    // 4. Award points (update user, log to points_log)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, points')
      .eq('id', event.user_id)
      .single();
    if (userError || !user) continue;
    const newPoints = (user.points || 0) + rule.points_awarded;
    await supabase.from('users').update({ points: newPoints }).eq('id', event.user_id);
    await supabase.from('points_log').insert({
      user_id: event.user_id,
      points: rule.points_awarded,
      reason: rule.label || rule.event_type,
      created_at: new Date().toISOString(),
    });

    // 5. Log event
    await supabase.from('gamification_event_logs').insert({
      user_id: event.user_id,
      event_type: event.event_type,
      payload: event.payload,
      rule_id: rule.id,
      points_awarded: rule.points_awarded,
      created_at: new Date().toISOString(),
    });

    // 6. Check for badge unlocks (example: XP threshold)
    // If the rule has a linked badge, award it
    if (rule.badge_id) {
      // Check if user already has badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', event.user_id)
        .eq('badge_id', rule.badge_id)
        .single();
      if (!existingBadge) {
        await supabase.from('user_badges').insert({
          user_id: event.user_id,
          badge_id: rule.badge_id,
          earned_at: new Date().toISOString(),
        });
        // Log badge
        await supabase.from('gamification_event_logs').insert({
          user_id: event.user_id,
          event_type: 'BADGE_AWARDED',
          badge_id: rule.badge_id,
          payload: {},
          created_at: new Date().toISOString(),
        });
      }
    }
  }
} 