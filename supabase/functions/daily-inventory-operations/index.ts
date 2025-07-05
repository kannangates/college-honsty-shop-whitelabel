import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface InventoryRow {
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  wastage_stock: number;
  order_count: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  sales: number;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
}

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface InventoryRecord {
  id?: string | null;
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  wastage_stock: number;
  order_count: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  sales: number;
  created_at: string;
  products?: { name: string };
}

interface SupabaseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: boolean) => Promise<{ data: unknown[] | null; error: Error | null }>;
      gte: (column: string, value: string) => {
        lt: (column: string, value: string) => Promise<{ data: unknown[] | null; error: Error | null }>;
      };
    };
    delete: () => {
      gte: (column: string, value: string) => {
        lt: (column: string, value: string) => Promise<{ error: Error | null }>;
      };
    };
    insert: (data: Omit<InventoryRecord, 'id'>[]) => Promise<{ error: Error | null }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation') || 'sync';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (operation) {
      case 'sync': {
        return await syncInventoryData(supabase, date);
      }
      case 'save': {
        const body = await req.json();
        return await saveInventoryData(supabase, body.data, date);
      }
      case 'export': {
        const format = url.searchParams.get('format') || 'excel';
        return await exportInventoryData(supabase, date, format);
      }
      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('❌ Error in daily inventory operations:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function syncInventoryData(supabase: SupabaseClient, date: string) {
  console.log(`🔄 Syncing inventory data for ${date}`);

  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, unit_price, opening_stock')
    .eq('is_archived', false);

  if (productsError) throw productsError;

  // Get existing inventory for the date
  const { data: existingInventory, error: inventoryError } = await supabase
    .from('daily_inventory')
    .select('*')
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);

  if (inventoryError) throw inventoryError;

  // Get order counts for the date
  const { data: orderCounts, error: orderError } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);

  if (orderError) throw orderError;

  // Aggregate order counts by product
  const orderCountMap = (orderCounts as OrderItem[]).reduce((acc: Record<string, number>, item: OrderItem) => {
    acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
    return acc;
  }, {});

  // Build inventory data
  const inventoryData = (products as Product[]).map((product: Product) => {
    const existing = (existingInventory as InventoryRecord[]).find((inv: InventoryRecord) => inv.product_id === product.id);
    const orderCount = orderCountMap[product.id] || 0;
    const openingStock = existing?.opening_stock || product.opening_stock;
    const additionalStock = existing?.additional_stock || 0;
    const estimatedClosingStock = openingStock + additionalStock - orderCount;
    const actualClosingStock = existing?.actual_closing_stock || 0;
    const wastedStock = existing?.wastage_stock || 0;
    const stolenStock = Math.max(0, estimatedClosingStock - (actualClosingStock + wastedStock));
    const sales = orderCount * product.unit_price;

    return {
      id: existing?.id || null,
      product: product.name,
      product_id: product.id,
      orderCount,
      openingStock,
      additionalStock,
      actualClosingStock,
      wastedStock,
      unitPrice: product.unit_price,
      estimatedClosingStock,
      stolenStock,
      sales
    };
  });

  return new Response(
    JSON.stringify({ data: inventoryData }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function saveInventoryData(supabase: SupabaseClient, inventoryRows: InventoryRow[], date: string) {
  console.log(`💾 Saving inventory data for ${date}, ${inventoryRows.length} rows`);

  const upsertData = inventoryRows.map(row => ({
    product_id: row.product_id,
    opening_stock: row.opening_stock,
    additional_stock: row.additional_stock,
    actual_closing_stock: row.actual_closing_stock,
    wastage_stock: row.wastage_stock,
    order_count: row.order_count,
    estimated_closing_stock: row.estimated_closing_stock,
    stolen_stock: row.stolen_stock,
    sales: row.sales,
    created_at: `${date}T00:00:00`
  }));

  // Delete existing records for the date first
  const { error: deleteError } = await supabase
    .from('daily_inventory')
    .delete()
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);

  if (deleteError) throw deleteError;

  // Insert new records
  const { error: insertError } = await supabase
    .from('daily_inventory')
    .insert(upsertData);

  if (insertError) throw insertError;

  return new Response(
    JSON.stringify({ success: true, message: 'Inventory data saved successfully' }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function exportInventoryData(supabase: SupabaseClient, date: string, format: string) {
  console.log(`📤 Exporting inventory data for ${date} as ${format}`);

  // Get inventory data with product names
  const { data: inventoryData, error } = await supabase
    .from('daily_inventory')
    .select(`
      *,
      products:product_id (name)
    `)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);

  if (error) throw error;

  const headers = [
    'Product',
    'Order Count',
    'Opening Stock',
    'Additional Stock',
    'Estimated Closing Stock',
    'Actual Closing Stock',
    'Wasted Stock',
    'Stolen Stock',
    'Sales'
  ];

  if (format === 'csv') {
    let csvContent = headers.join(',') + '\n';
    (inventoryData as InventoryRecord[]).forEach((row: InventoryRecord) => {
      const csvRow = [
        row.products?.name || 'Unknown',
        row.order_count,
        row.opening_stock,
        row.additional_stock,
        row.estimated_closing_stock,
        row.actual_closing_stock,
        row.wastage_stock,
        row.stolen_stock,
        row.sales
      ].join(',');
      csvContent += csvRow + '\n';
    });

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="daily-inventory-${date}.csv"`
      }
    });
  }

  // For Excel format, return JSON that frontend can convert
  return new Response(
    JSON.stringify({ 
      headers,
      data: (inventoryData as InventoryRecord[]).map((row: InventoryRecord) => [
        row.products?.name || 'Unknown',
        row.order_count,
        row.opening_stock,
        row.additional_stock,
        row.estimated_closing_stock,
        row.actual_closing_stock,
        row.wastage_stock,
        row.stolen_stock,
        row.sales
      ])
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
