import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, productId, quantity, source } = await req.json();

    console.log(`Stock operation: ${operation}, Product: ${productId}, Quantity: ${quantity}, Source: ${source}`);

    switch (operation) {
      case 'restock_warehouse':
        return await restockWarehouse(productId, quantity, source);

      case 'restock_shelf':
        return await restockShelf(productId, quantity, source);

      case 'adjust_shelf_stock':
        return await adjustShelfStock(productId, quantity, source);

      case 'get_stock_status':
        return await getStockStatus(productId);

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error('Stock management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function restockWarehouse(productId: string, quantity: number, source: string) {
  // Get current product data
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('warehouse_stock, name')
    .eq('id', productId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch product: ${fetchError.message}`);

  const newWarehouseStock = (product.warehouse_stock || 0) + quantity;

  // Update warehouse stock
  const { data, error } = await supabase
    .from('products')
    .update({
      warehouse_stock: newWarehouseStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update warehouse stock: ${error.message}`);

  // Log stock movement
  await logStockMovement({
    product_id: productId,
    delta_warehouse: quantity,
    delta_shelf: 0,
    reason: `Warehouse restock from ${source}`,
    created_by: null
  });

  console.log(`Warehouse restocked: ${product.name} +${quantity} (new total: ${newWarehouseStock})`);

  return new Response(
    JSON.stringify({
      success: true,
      data,
      message: `Warehouse stock increased by ${quantity}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function restockShelf(productId: string, quantity: number, source: string) {
  // Get current product data
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('warehouse_stock, shelf_stock, name')
    .eq('id', productId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch product: ${fetchError.message}`);

  const currentWarehouseStock = product.warehouse_stock || 0;
  const currentShelfStock = product.shelf_stock || 0;

  // Validate warehouse stock availability
  if (currentWarehouseStock < quantity) {
    throw new Error(`Insufficient warehouse stock. Available: ${currentWarehouseStock}, Requested: ${quantity}`);
  }

  const newWarehouseStock = currentWarehouseStock - quantity;
  const newShelfStock = currentShelfStock + quantity;

  // Update both stocks
  const { data, error } = await supabase
    .from('products')
    .update({
      warehouse_stock: newWarehouseStock,
      shelf_stock: newShelfStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update shelf stock: ${error.message}`);

  // Log stock movement
  await logStockMovement({
    product_id: productId,
    delta_warehouse: -quantity,
    delta_shelf: quantity,
    reason: `Shelf restock from warehouse via ${source}`,
    created_by: null
  });

  console.log(`Shelf restocked: ${product.name} +${quantity} from warehouse (warehouse: ${newWarehouseStock}, shelf: ${newShelfStock})`);

  return new Response(
    JSON.stringify({
      success: true,
      data,
      message: `Shelf stock increased by ${quantity} from warehouse`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function adjustShelfStock(productId: string, quantity: number, source: string) {
  // Get current product data
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('shelf_stock, name')
    .eq('id', productId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch product: ${fetchError.message}`);

  const currentShelfStock = product.shelf_stock || 0;
  const newShelfStock = currentShelfStock + quantity; // quantity can be negative for deductions

  // Prevent negative shelf stock
  if (newShelfStock < 0) {
    throw new Error(`Insufficient shelf stock. Available: ${currentShelfStock}, Requested: ${Math.abs(quantity)}`);
  }

  // Update shelf stock
  const { data, error } = await supabase
    .from('products')
    .update({
      shelf_stock: newShelfStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new Error(`Failed to adjust shelf stock: ${error.message}`);

  // Log stock movement
  await logStockMovement({
    product_id: productId,
    delta_warehouse: 0,
    delta_shelf: quantity,
    reason: `Shelf stock adjustment from ${source}`,
    created_by: null
  });

  const operation = quantity > 0 ? 'increased' : 'decreased';
  console.log(`Shelf stock ${operation}: ${product.name} ${quantity > 0 ? '+' : ''}${quantity} (new total: ${newShelfStock})`);

  return new Response(
    JSON.stringify({
      success: true,
      data,
      message: `Shelf stock ${operation} by ${Math.abs(quantity)}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getStockStatus(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('warehouse_stock, shelf_stock, name')
    .eq('id', productId)
    .single();

  if (error) throw new Error(`Failed to get stock status: ${error.message}`);

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function logStockMovement(movement: {
  product_id: string;
  delta_warehouse: number;
  delta_shelf: number;
  reason: string;
  created_by: string | null;
}) {
  try {
    await supabase
      .from('stock_movements')
      .insert(movement);
  } catch (error) {
    console.error('Failed to log stock movement:', error);
    // Don't throw here to avoid breaking the main operation
  }
}