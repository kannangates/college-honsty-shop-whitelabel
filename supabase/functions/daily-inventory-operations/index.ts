import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { dailyInventorySaveSchema, inventoryOperationSchema } from '../_shared/schemas.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

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

interface InventoryRecord extends InventoryRow {
  id?: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  current_stock: number;
  created_at?: string;
  created_by?: string;
  image_url?: string;
  is_archived?: boolean;
  opening_stock?: number;
  status?: string;
  unit_price?: number;
  [key: string]: string | number | boolean | undefined;
}

interface StockOperationRow {
  id?: string;
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  wastage_stock: number;
  sales: number;
  order_count: number;
  created_at: string;
  updated_at: string | null;
}

interface StockOperation extends StockOperationRow {
  product: Product;
}

interface Filters {
  category: string;
  status: string;
  stockStatus: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation') || 'sync';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const format = url.searchParams.get('format') || 'excel';
    
    // Validate query parameters
    const operationSchema = z.enum(['sync', 'save', 'export']);
    const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD');
    const formatSchema = z.enum(['excel', 'csv', 'json']);
    
    const validatedOperation = operationSchema.safeParse(operation);
    const validatedDate = dateSchema.safeParse(date);
    const validatedFormat = formatSchema.safeParse(format);
    
    if (!validatedOperation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid operation',
          details: validatedOperation.error.issues.map(e => ({ field: 'operation', message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validatedDate.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid date',
          details: validatedDate.error.issues.map(e => ({ field: 'date', message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validatedFormat.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid format',
          details: validatedFormat.error.issues.map(e => ({ field: 'format', message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validOp = validatedOperation.data;
    const validDate = validatedDate.data;
    const validFormat = validatedFormat.data;
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

  try {
    // Get all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_archived', false)
      .eq('status', 'active');

    if (productsError) throw productsError;

    // Get existing inventory records for the date
    const { data: existingRecords, error: existingError } = await supabase
      .from('daily_stock_operations')
      .select('*')
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`);

    if (existingError) throw existingError;

    // Create inventory rows for products that don't have records
    const existingProductIds = new Set(existingRecords?.map(r => r.product_id) || []);
    const newRecords: Omit<InventoryRecord, 'id'>[] = [];

    for (const product of products || []) {
      if (!existingProductIds.has(product.id)) {
        newRecords.push({
          product_id: product.id,
          opening_stock: product.current_stock || 0,
          additional_stock: 0,
          actual_closing_stock: product.current_stock || 0,
          estimated_closing_stock: product.current_stock || 0,
          stolen_stock: 0,
          wastage_stock: 0,
          sales: 0,
          order_count: 0,
          created_at: new Date().toISOString()
        });
      }
    }

    if (newRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('daily_stock_operations')
        .insert(newRecords);

      if (insertError) throw insertError;
    }

    // Return merged data
    const allRecords = [
      ...(existingRecords || []),
      ...newRecords
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        records: allRecords,
        synced: newRecords.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error syncing inventory data:', error);
    throw error;
  }
}

async function saveInventoryData(supabase: SupabaseClient, inventoryRows: InventoryRow[], date: string) {
  console.log(`💾 Saving inventory data for ${date}, ${inventoryRows.length} rows`);

  try {
    // Convert to proper format and add timestamps
    const records: Omit<InventoryRecord, 'id'>[] = inventoryRows.map(row => ({
      ...row,
      created_at: new Date().toISOString()
    }));

    // Upsert the records
    const { error } = await supabase
      .from('daily_stock_operations')
      .upsert(records, { onConflict: 'product_id,created_at' });

    if (error) throw error;

    // Update product current_stock with actual_closing_stock
    const updates = inventoryRows.map(row =>
      supabase
        .from('products')
        .update({ current_stock: row.actual_closing_stock })
        .eq('id', row.product_id)
    );

    await Promise.all(updates);

    return new Response(
      JSON.stringify({ 
        success: true, 
        saved: inventoryRows.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error saving inventory data:', error);
    throw error;
  }
}

async function exportInventoryData(supabase: SupabaseClient, date: string, format: string) {
  console.log(`📤 Exporting inventory data for ${date} as ${format}`);

  try {
    const { data: records, error } = await supabase
      .from('daily_stock_operations')
      .select(`
        *,
        products (
          name,
          category,
          unit_price
        )
      `)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (format === 'csv') {
      const csv = convertToCSV(records || []);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inventory-${date}.csv"`
        }
      });
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          records: records || [],
          format 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Error exporting inventory data:', error);
    throw error;
  }
}

function convertToCSV(records: StockOperation[]): string {
  if (records.length === 0) return '';

  const headers = [
    'Product Name',
    'Category',
    'Opening Stock',
    'Additional Stock',
    'Sales',
    'Stolen Stock',
    'Wastage Stock',
    'Actual Closing Stock',
    'Estimated Closing Stock',
    'Order Count',
    'Unit Price',
    'Total Value'
  ];

  const rows = records.map(record => [
    record.product?.name || 'Unknown',
    record.product?.category || 'Unknown',
    record.opening_stock,
    record.additional_stock,
    record.sales,
    record.stolen_stock,
    record.wastage_stock,
    record.actual_closing_stock,
    record.estimated_closing_stock,
    record.order_count,
    record.product?.unit_price || 0,
    (record.product?.unit_price || 0) * record.actual_closing_stock
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}
