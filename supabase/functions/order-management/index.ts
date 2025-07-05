
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          payment_status: string
          payment_mode: string | null
          transaction_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
          updated_by: string | null
        }
      }
      users: {
        Row: {
          id: string
          student_id: string
          name: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
      }
      products: {
        Row: {
          id: string
          name: string
        }
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    const { operation, ...params } = await req.json()

    switch (operation) {
      case 'fetch_orders': {
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            users!orders_user_id_fkey(student_id, name),
            order_items(
              *,
              products(name)
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ orders }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_stats': {
        const today = new Date().toISOString().split('T')[0]
        
        // Today's orders count
        const { count: todayOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)

        // Today's revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
          .eq('payment_status', 'paid')

        const revenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

        // Pending orders
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'unpaid')

        // Average order value
        const { data: avgData } = await supabase
          .from('orders')
          .select('total_amount')

        const avgOrder = avgData?.length 
          ? avgData.reduce((sum, order) => sum + order.total_amount, 0) / avgData.length 
          : 0

        return new Response(
          JSON.stringify({
            todayOrders: todayOrders || 0,
            revenue,
            pendingOrders: pendingOrders || 0,
            avgOrder: Math.round(avgOrder)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_order': {
        const { id, ...updateData } = params
        
        const { data, error } = await supabase
          .from('orders')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
            updated_by: params.updated_by
          })
          .eq('id', id)
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ order: data[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
