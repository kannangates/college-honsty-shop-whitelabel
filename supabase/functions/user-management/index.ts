import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logAdminAction } from '../_shared/auditLog.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation, ...body } = await req.json();
    console.log(`👥 User management operation: ${operation}`);

    // Get IP and User Agent for audit logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (operation) {
      case 'fetch_users':
        return await fetchUsers(supabase, user.id, userProfile.role, ipAddress, userAgent);
      case 'fetch_leaderboard':
        return await fetchLeaderboard(supabase, user.id, userProfile.role, ipAddress, userAgent);
      case 'update_user':
        return await updateUser(supabase, body, user.id, userProfile.role, ipAddress, userAgent);
      case 'get_stats':
        return await getUserStats(supabase, user.id, userProfile.role, ipAddress, userAgent);
      case 'update_last_signin':
        return await updateLastSignin(supabase, body.userId);
      default:
        throw new Error('Invalid operation');
    }
  } catch (error: unknown) {
    console.error('❌ Error in user management:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function fetchLeaderboard(supabase: SupabaseClient, userId: string, userRole: string, ipAddress: string, userAgent: string) {
  console.log('🏆 Fetching leaderboard data');

  // Audit log: Admin accessing student data
  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'SELECT',
    tableName: 'users',
    newValues: { operation: 'fetch_leaderboard', note: 'Admin accessed student leaderboard with PII' },
    ipAddress,
    userAgent
  });

  const { data, error } = await supabase
    .from('users')
    .select('id, student_id, name, points, role, status')
    .eq('role', 'student')
    .eq('status', 'active')
    .order('points', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ users: data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function updateLastSignin(supabase: SupabaseClient, userId: string) {
  console.log('🕐 Updating last signin for user:', userId);

  const { error } = await supabase
    .from('users')
    .update({ last_signed_in_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function fetchUsers(supabase: SupabaseClient, userId: string, userRole: string, ipAddress: string, userAgent: string) {
  console.log('📋 Fetching all users');

  // Audit log: Admin accessing all user data with PII
  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'SELECT',
    tableName: 'users',
    newValues: { operation: 'fetch_users', note: 'Admin accessed all user data with PII (names, emails, student IDs)' },
    ipAddress,
    userAgent
  });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(
    JSON.stringify({ users: data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

interface UserUpdate {
  id: string;
  name?: string;
  email?: string;
  department?: string;
  mobile_number?: string;
  status?: string;
  [key: string]: string | undefined;
}

async function updateUser(supabase: SupabaseClient, userData: UserUpdate, userId: string, userRole: string, ipAddress: string, userAgent: string) {
  console.log('✏️ Updating user:', userData.id);

  // Audit log: Admin updating user data
  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'UPDATE',
    tableName: 'users',
    recordId: userData.id,
    newValues: userData,
    ipAddress,
    userAgent
  });

  const { data, error } = await supabase
    .from('users')
    .update({
      name: userData.name,
      email: userData.email,
      department: userData.department,
      mobile_number: userData.mobile_number,
      status: userData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.id)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({ user: data[0] }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function getUserStats(supabase: SupabaseClient, userId: string, userRole: string, ipAddress: string, userAgent: string) {
  console.log('📊 Getting user statistics');

  // Audit log: Admin accessing user statistics
  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'SELECT',
    tableName: 'users',
    newValues: { operation: 'get_stats', note: 'Admin accessed user statistics' },
    ipAddress,
    userAgent
  });

  // Total students
  const { count: totalStudents, error: totalError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (totalError) throw totalError;

  // Active this month
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  const { count: activeThisMonth, error: activeError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_signed_in_at', startOfMonth.toISOString());

  if (activeError) throw activeError;

  // Highest points
  const { data: highestPointsData, error: pointsError } = await supabase
    .from('users')
    .select('points')
    .order('points', { ascending: false })
    .limit(1);

  if (pointsError) throw pointsError;

  // Unique departments
  const { data: departmentsData, error: deptError } = await supabase
    .from('users')
    .select('department')
    .not('department', 'is', null);

  if (deptError) throw deptError;

  const uniqueDepartments = new Set((departmentsData as { department: string }[]).map((d) => d.department)).size;

  return new Response(
    JSON.stringify({
      totalStudents: totalStudents || 0,
      activeThisMonth: activeThisMonth || 0,
      highestPoints: highestPointsData[0]?.points || 0,
      departments: uniqueDepartments
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
