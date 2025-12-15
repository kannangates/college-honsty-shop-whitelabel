// User Management Edge Function - handles admin operations on user data
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logAdminAction } from '../_shared/auditLog.ts';
import { userManagementSchema } from '../_shared/schemas.ts';
import { verifyTOTP } from '../_shared/totp.ts';

const PII_FIELDS = ['student_id', 'email', 'mobile_number'];

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

    // Check if requesting user is admin using secure user_roles table
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Unable to verify role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roles = userRoles?.map(r => r.role) || [];
    const isAdmin = roles.includes('admin') || roles.includes('developer');

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get role for audit logging (first admin role found)
    const userRole = roles.includes('admin') ? 'admin' : 'developer';

    const requestBody = await req.json();

    // Validate input with Zod schema
    const validationResult = userManagementSchema.safeParse(requestBody);
    if (!validationResult.success) {
      type ZodIssue = { path: Array<string | number>; message: string };
      const issues = (validationResult as unknown as { error: { issues: ZodIssue[] } }).error.issues as ZodIssue[];
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: issues.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation } = validationResult.data;
    console.log(`👥 User management operation: ${operation}`);

    // Get IP and User Agent for audit logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (operation) {
      case 'fetch_user_summary':
        return await fetchUserSummary(supabase, user.id, userRole, ipAddress, userAgent);
      case 'fetch_user_details':
        return await fetchUserDetails(
          supabase,
          validationResult.data as SensitiveAccessRequest,
          user.id,
          userRole,
          ipAddress,
          userAgent
        );
      case 'fetch_leaderboard':
        return await fetchLeaderboard(supabase, user.id, userRole, ipAddress, userAgent);
      case 'update_user':
        if ('id' in validationResult.data) {
          const updateData = validationResult.data as unknown as UserUpdate;
          return await updateUser(supabase, updateData, user.id, userRole, ipAddress, userAgent);
        }
        throw new Error('Invalid update_user data');
      case 'get_stats':
        return await getUserStats(supabase, user.id, userRole, ipAddress, userAgent);
      case 'update_last_signin':
        if ('userId' in validationResult.data) {
          const data = validationResult.data as unknown as { userId: string };
          return await updateLastSignin(supabase, data.userId);
        }
        throw new Error('Invalid update_last_signin data');
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

async function fetchUserSummary(supabase: SupabaseClient, userId: string, userRole: string, ipAddress: string, userAgent: string) {
  console.log('📋 Fetching user roster (summary only)');

  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'SELECT',
    tableName: 'users',
    newValues: { operation: 'fetch_user_summary', note: 'Admin accessed masked user roster. PII fields withheld.' },
    ipAddress,
    userAgent
  });

  const { data, error } = await supabase
    .from('users')
    .select('id, student_id, name, department, role, points, status, shift, created_at, updated_at, last_signed_in_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const sanitizedUsers = (data || []).map((user) => ({
    id: user.id,
    name: user.name,
    department: user.department,
    role: user.role,
    points: user.points,
    status: user.status,
    shift: user.shift,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_signed_in_at: user.last_signed_in_at,
    masked_student_id: maskStudentId(user.student_id)
  }));

  return new Response(
    JSON.stringify({ users: sanitizedUsers }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function fetchUserDetails(
  supabase: SupabaseClient,
  request: SensitiveAccessRequest,
  userId: string,
  userRole: string,
  ipAddress: string,
  userAgent: string
) {
  console.log('🔐 Fetching sensitive user details');

  await ensureMFAIsValid(supabase, userId, request.mfaToken);

  const { data, error } = await supabase
    .from('users')
    .select('id, student_id, name, email, department, mobile_number, status, role, points, shift, created_at, updated_at, last_signed_in_at')
    .eq('id', request.targetUserId)
    .single();

  if (error) throw error;

  await logAdminAction({
    supabase,
    userId,
    userRole,
    action: 'SELECT',
    tableName: 'users',
    recordId: request.targetUserId,
    newValues: {
      operation: 'fetch_user_details',
      reason: request.reason,
      pii_fields: PII_FIELDS
    },
    ipAddress,
    userAgent
  });

  return new Response(
    JSON.stringify({
      user: {
        ...data,
        masked_student_id: maskStudentId(data.student_id)
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

interface UserUpdate extends Record<string, unknown> {
  id: string;
  name?: string;
  email?: string;
  department?: string;
  mobile_number?: string;
  status?: string;
  role?: 'admin' | 'student' | 'teacher' | 'developer';
  shift?: string;
}

interface SensitiveAccessRequest {
  targetUserId: string;
  reason: string;
  mfaToken: string;
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
      role: userData.role,
      shift: userData.shift,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.id)
    .select();

  if (error) throw error;

  // Also update auth.users metadata to keep in sync
  if (userData.role) {
    try {
      await supabase.auth.admin.updateUserById(userData.id, {
        user_metadata: { role: userData.role }
      });
    } catch (metaError) {
      console.warn('Failed to update auth metadata:', metaError);
      // Continue - the users table update succeeded
    }
  }

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

function maskStudentId(studentId?: string | null): string {
  if (!studentId) return '***';
  const normalized = studentId.trim();
  if (normalized.length <= 3) {
    return `${'*'.repeat(Math.max(0, normalized.length - 1))}${normalized.slice(-1)}`;
  }

  const visibleCharacters = Math.min(3, normalized.length);
  const maskedCharacters = Math.max(0, normalized.length - visibleCharacters);

  return `${'*'.repeat(maskedCharacters)}${normalized.slice(-visibleCharacters)}`;
}

async function ensureMFAIsValid(supabase: SupabaseClient, adminUserId: string, mfaToken: string): Promise<void> {
  if (!mfaToken) {
    throw new Error('MFA token is required to view sensitive student data.');
  }

  const sanitizedToken = mfaToken.replace(/\s+/g, '');

  // Check if MFA is enabled for this user
  const { data, error } = await supabase
    .from('user_mfa')
    .select('secret, enabled')
    .eq('user_id', adminUserId)
    .single();

  if (error || !data) {
    throw new Error('MFA is not configured for this administrator account.');
  }

  if (!data.enabled) {
    throw new Error('Enable MFA before accessing PII.');
  }

  // Use the shared TOTP implementation for consistency
  const verified = await verifyTOTP(sanitizedToken, data.secret, 1, 30);

  if (!verified) {
    throw new Error('Invalid MFA token. Please use a fresh code from your authenticator app.');
  }
}
