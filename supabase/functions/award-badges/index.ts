import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface BadgeAwardResult {
  newBadges: string[];
  totalBadges: number;
  userPoints: number;
}

interface Badge {
  id: string;
  name: string;
  badge_type: string;
  min_points: number;
  is_active: boolean;
}

interface UserBadge {
  badge_id: string;
}

interface Order {
  id: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

interface SupabaseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<SupabaseResponse<unknown>>;
      };
      order: (column: string, options: { ascending: boolean }) => Promise<SupabaseResponse<unknown[]>>;
    };
    insert: (data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, orderId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user's current points and data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points, created_at')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get all active badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('min_points', { ascending: true })

    if (badgesError) throw badgesError

    // Get user's current badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    if (userBadgesError) throw userBadgesError

    const earnedBadgeIds = new Set<string>(userBadges?.map((ub: UserBadge) => ub.badge_id) || [])
    const newBadges: string[] = []

    // Check tier badges (based on points)
    const tierBadges = badges?.filter((b: Badge) => b.badge_type === 'tier' && b.min_points <= userData.points) || []
    for (const badge of tierBadges) {
      if (!earnedBadgeIds.has(badge.id)) {
        await awardBadge(supabase, userId, badge.id, badge.name)
        newBadges.push(badge.name)
      }
    }

    // Check achievement badges with custom logic
    await checkAchievementBadges(supabase, userId, badges || [], earnedBadgeIds, newBadges, orderId)

    // Create notifications for new badges
    for (const badgeName of newBadges) {
      await createBadgeNotification(supabase, userId, badgeName)
    }

    const result: BadgeAwardResult = {
      newBadges,
      totalBadges: earnedBadgeIds.size + newBadges.length,
      userPoints: userData.points
    }

    console.log('🎉 Badge awarding completed:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error awarding badges:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function awardBadge(supabase: SupabaseClient, userId: string, badgeId: string, badgeName: string) {
  const { error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to award badge:', badgeName, error)
  } else {
    console.log('✅ Awarded badge:', badgeName)
  }
}

async function checkAchievementBadges(
  supabase: SupabaseClient, 
  userId: string, 
  badges: Badge[], 
  earnedBadgeIds: Set<string>, 
  newBadges: string[],
  orderId?: string
) {
  // Get user's order count and payment data
  const { data: orders } = await supabase
    .from('orders')
    .select('id, payment_status, paid_at, created_at')
    .eq('user_id', userId)

  const orderCount = orders?.length || 0
  const paidOrders = orders?.filter((o: Order) => o.payment_status === 'paid') || []

  // First order badge
  const firstOrderBadge = badges.find(b => b.name === '🎉 First Checkout')
  if (firstOrderBadge && orderCount >= 1 && !earnedBadgeIds.has(firstOrderBadge.id)) {
    await awardBadge(supabase, userId, firstOrderBadge.id, firstOrderBadge.name)
    newBadges.push(firstOrderBadge.name)
  }

  // Honest buyer badge (10+ paid orders)
  const honestBuyerBadge = badges.find(b => b.name === '✅ Honest Buyer')
  if (honestBuyerBadge && paidOrders.length >= 10 && !earnedBadgeIds.has(honestBuyerBadge.id)) {
    await awardBadge(supabase, userId, honestBuyerBadge.id, honestBuyerBadge.name)
    newBadges.push(honestBuyerBadge.name)
  }

  // Payment timing badges
  const onTimePayments = paidOrders.filter((order: Order) => {
    if (!order.paid_at || !order.created_at) return false
    const timeDiff = new Date(order.paid_at).getTime() - new Date(order.created_at).getTime()
    return timeDiff <= 30 * 60 * 60 * 1000 // 30 hours
  })

  const paymentHeroBadge = badges.find(b => b.name === '⏰ Payment Hero')
  if (paymentHeroBadge && onTimePayments.length >= 20 && !earnedBadgeIds.has(paymentHeroBadge.id)) {
    await awardBadge(supabase, userId, paymentHeroBadge.id, paymentHeroBadge.name)
    newBadges.push(paymentHeroBadge.name)
  }

  // Check for immediate payment streaks
  await checkPaymentStreaks(supabase, userId, badges, earnedBadgeIds, newBadges, orders || [])
}

async function checkPaymentStreaks(
  supabase: SupabaseClient,
  userId: string,
  badges: Badge[],
  earnedBadgeIds: Set<string>,
  newBadges: string[],
  orders: Order[]
) {
  // Get immediate payments (within 1 hour)
  const immediatePayments = orders
    .filter(order => {
      if (!order.paid_at || !order.created_at) return false
      const timeDiff = new Date(order.paid_at).getTime() - new Date(order.created_at).getTime()
      return timeDiff <= 60 * 60 * 1000 // 1 hour
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Check for consecutive streaks
  let currentStreak = 0
  let maxStreak = 0
  
  for (let i = 0; i < immediatePayments.length; i++) {
    if (i === 0) {
      currentStreak = 1
    } else {
      const prevDate = new Date(immediatePayments[i-1].created_at)
      const currDate = new Date(immediatePayments[i].created_at)
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))
      
      if (daysDiff <= 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak)
  }

  // Award streak badges
  const streak7Badge = badges.find(b => b.name === '🗓️ 7-Day Combo')
  if (streak7Badge && maxStreak >= 7 && !earnedBadgeIds.has(streak7Badge.id)) {
    await awardBadge(supabase, userId, streak7Badge.id, streak7Badge.name)
    newBadges.push(streak7Badge.name)
  }

  const streak30Badge = badges.find(b => b.name === '🔥 30-Day Combo')
  if (streak30Badge && maxStreak >= 30 && !earnedBadgeIds.has(streak30Badge.id)) {
    await awardBadge(supabase, userId, streak30Badge.id, streak30Badge.name)
    newBadges.push(streak30Badge.name)
  }
}

async function createBadgeNotification(supabase: SupabaseClient, userId: string, badgeName: string) {
  await supabase
    .from('notifications')
    .insert({
      title: '🏆 Badge Unlocked!',
      body: `Congratulations! You've earned the "${badgeName}" badge!`,
      type: 'badge_unlock',
      target_user_id: userId,
      is_pinned: false
    })
}
