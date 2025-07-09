
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface OrderRow { total_amount: number }
interface ProductRow { name: string; current_stock: number; opening_stock: number }
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

    // Parallel execution of independent queries for better performance
    const [
      ordersToday,
      revenueData,
      pendingOrders,
      lowStockItems,
      topStudentsData,
      topDepartmentsData,
      stockData
    ] = await Promise.all([
      // Orders today count
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),

      // Revenue today with optimized query
      supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', todayStart.toISOString()),

      // Pending orders count
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'unpaid'),

      // Low stock items count
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .lt('current_stock', 10)
        .eq('is_archived', false),

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
        .select('name, current_stock, opening_stock')
        .eq('is_archived', false)
        .order('current_stock', { ascending: true })
        .limit(5)
    ]);

    // Calculate revenue efficiently
    const revenue = (revenueData.data as OrderRow[] | null)?.reduce((sum: number, order: OrderRow) => sum + Number(order.total_amount), 0) || 0;

    // Format stock data efficiently
    const formattedStockData = (stockData.data as ProductRow[] | null)?.map((item: ProductRow) => ({
      product: item.name,
      current: item.current_stock,
      opening: item.opening_stock,
      status: item.current_stock < 5 ? 'Critical' : item.current_stock < 10 ? 'Low' : 'Good'
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
        todayOrders: ordersToday.count || 0,
        revenue: revenue,
        pendingOrders: pendingOrders.count || 0,
        lowStockItems: lowStockItems.count || 0,
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
