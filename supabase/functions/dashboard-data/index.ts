
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { triggerN8nWebhook } from '../_shared/n8nWebhook.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';


interface OrderRow { total_amount: number }
interface ProductRow { name: string; shelf_stock: number; warehouse_stock: number }
interface TopStudentRow { student_id: string; name: string; department: string; points: number; rank: number }
interface TopDeptRow { department: string; points: number; rank: number }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📊 Fetching optimized dashboard data');

    // Get current user from auth header
    const authHeader = req.headers.get('Authorization');
    let currentUserId = null;

    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        currentUserId = user?.id;
      } catch (error) {
        console.log('Could not get user from auth header:', error);
      }
      // Validate optional query parameters
      const url = new URL(req.url);
      const cacheParam = url.searchParams.get('cache');

      const cacheSchema = z.enum(['true', 'false']).optional();
      const cacheValidation = cacheSchema.safeParse(cacheParam);

      if (!cacheValidation.success && cacheParam !== null) {
        const errorDetails = 'error' in cacheValidation
          ? cacheValidation.error.issues.map(e => ({ field: 'cache', message: e.message }))
          : [];
        return new Response(
          JSON.stringify({
            error: 'Invalid cache parameter',
            details: errorDetails
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Refresh rankings only if needed (cache for 5 minutes)
    const lastRefresh = await supabase
      .from('top_students')
      .select('updated_at')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const shouldRefresh = !lastRefresh.data ||
      (new Date().getTime() - new Date(lastRefresh.data.updated_at).getTime()) > 5 * 60 * 1000;

    if (shouldRefresh) {
      console.log('🔄 Refreshing rankings');
      await supabase.rpc('refresh_rankings');
    }

    // Use optimized queries with specific column selection
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get current user ID for user-specific queries
    let currentUserOrdersCount = 0;
    if (currentUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', currentUserId)
        .single();

      if (userData) {
        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('payment_status', 'unpaid');
        currentUserOrdersCount = count || 0;
      }
    }

    // Parallel execution of independent queries for better performance
    const [
      totalOrders,
      allUnpaidOrdersValue,
      todayUnpaidOrders,
      topStudentsData,
      topDepartmentsData,
      stockData
    ] = await Promise.all([
      // Total orders count (all time) - all users
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true }),

      // Total unpaid orders value (all time) - all users
      supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'unpaid'),

      // Today's unpaid orders count - all users
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'unpaid')
        .gte('created_at', todayStart.toISOString()),

      // Top students with specific columns
      supabase
        .from('top_students')
        .select('student_id, name, department, points, rank')
        .eq('is_archived', false)
        .order('rank', { ascending: true })
        .limit(10),

      // Top departments with specific columns
      supabase
        .from('top_departments')
        .select('department, points, rank')
        .eq('is_archived', false)
        .order('rank', { ascending: true })
        .limit(3),

      // Sample stock data with specific columns
      supabase
        .from('products')
        .select('name, shelf_stock, warehouse_stock')
        .eq('is_archived', false)
        .order('shelf_stock', { ascending: true })
        .limit(5)
    ]);

    // Calculate total unpaid orders value efficiently
    const totalUnpaidValue = (allUnpaidOrdersValue.data as OrderRow[] | null)?.reduce((sum: number, order: OrderRow) => sum + Number(order.total_amount), 0) || 0;

    // Format stock data efficiently
    const formattedStockData = (stockData.data as ProductRow[] | null)?.map((item: ProductRow) => ({
      product: item.name,
      current: item.shelf_stock,
      warehouse: item.warehouse_stock,
      status: item.shelf_stock < 5 ? 'Critical' : item.shelf_stock < 10 ? 'Low' : 'Good'
    })) || [];

    // Get current user rank efficiently if authenticated
    let userRank = 0;
    if (currentUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('student_id, role')
        .eq('id', currentUserId)
        .single();

      if (userData?.student_id && userData?.role === 'student') {
        const userInTop = topStudentsData.data?.find((student: TopStudentRow) => student.student_id === userData.student_id);
        if (userInTop) {
          userRank = userInTop.rank;
        }
      }
    }

    const dashboardData = {
      stats: {
        totalOrders: totalOrders.count || 0,
        userPendingOrders: currentUserOrdersCount,
        todayUnpaidOrders: todayUnpaidOrders.count || 0,
        totalUnpaidOrdersValue: totalUnpaidValue,
        topDepartments: topDepartmentsData.data || []
      },
      topStudents: topStudentsData.data?.map((student: TopStudentRow) => ({
        id: student.student_id,
        name: student.name,
        department: student.department,
        points: student.points,
        rank: student.rank
      })) || [],
      userRank: userRank,
      stockData: formattedStockData
    };

    // Trigger n8n analytics webhook
    await triggerN8nWebhook('analytics', {
      event: 'dashboard_data_generated',
      stats: dashboardData.stats,
      topStudents: dashboardData.topStudents,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Optimized dashboard data fetched successfully');

    return new Response(
      JSON.stringify(dashboardData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120' // 2 minutes cache
        }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
