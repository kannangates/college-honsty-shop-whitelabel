import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { operation, orderId } = await req.json()

    switch (operation) {
      case 'restore_stock': {
        console.log('📦 Restoring stock for cancelled order:', orderId)
        
        // Get order items to restore stock
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId)

        if (orderItemsError) throw orderItemsError

        if (!orderItems || orderItems.length === 0) {
          return new Response(
            JSON.stringify({ success: true, message: 'No order items found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Restore stock for each product
        for (const item of orderItems) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('shelf_stock')
            .eq('id', item.product_id)
            .single()

          if (productError) {
            console.error('Error fetching product for stock restoration:', productError)
            continue
          }

          const newShelfStock = (product.shelf_stock || 0) + item.quantity
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              shelf_stock: newShelfStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id)

          if (updateError) {
            console.error('Error restoring stock for product:', item.product_id, updateError)
          } else {
            console.log(`✅ Restored ${item.quantity} units to product ${item.product_id}`)
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Stock restored successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'reduce_stock': {
        console.log('📦 Reducing stock for order:', orderId)
        
        // Get order items to reduce stock
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId)

        if (orderItemsError) throw orderItemsError

        if (!orderItems || orderItems.length === 0) {
          return new Response(
            JSON.stringify({ success: true, message: 'No order items found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Reduce stock for each product
        for (const item of orderItems) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('shelf_stock')
            .eq('id', item.product_id)
            .single()

          if (productError) {
            console.error('Error fetching product for stock reduction:', productError)
            continue
          }

          const newShelfStock = Math.max(0, (product.shelf_stock || 0) - item.quantity)
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              shelf_stock: newShelfStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id)

          if (updateError) {
            console.error('Error reducing stock for product:', item.product_id, updateError)
          } else {
            console.log(`✅ Reduced ${item.quantity} units from product ${item.product_id}`)
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Stock reduced successfully' }),
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})