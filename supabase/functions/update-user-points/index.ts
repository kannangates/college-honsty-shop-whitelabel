import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { triggerN8nWebhook } from '../_shared/n8nWebhook.ts';
import { updatePointsSchema } from '../_shared/schemas.ts';

interface UpdatePointsRequest {
  studentId: string;
  points: number;
  reason: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'developer')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();

    // Validate input with Zod schema
    const validationResult = updatePointsSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { studentId, points, reason } = validationResult.data;
    console.log('💰 Updating points for student:', studentId, 'points:', points, 'reason:', reason);

    // First, get the current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, points, department')
      .eq('student_id', studentId)
      .single();
    if (userError || !userData) {
      console.log('❌ User not found:', studentId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new points
    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + points;

    console.log('📊 Points calculation:', {
      current: currentPoints,
      adding: points,
      newTotal: newPoints
    });

    // Update user points
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          points: newPoints,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (updateError) {
        console.error('❌ Error updating user points:', updateError);
        return new Response(
          JSON.stringify({ error: `Failed to update user points: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (updateError) {
      console.error('❌ Exception updating user points:', updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update user points: ${updateError instanceof Error ? updateError.message : 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh rankings to update top_students table
    console.log('🔄 Refreshing rankings...');
    try {
      const { error: refreshError } = await supabase.rpc('refresh_rankings');
      
      if (refreshError) {
        console.error('⚠️ Warning: Rankings refresh failed:', refreshError);
        // Don't fail the request if rankings refresh fails
      }
    } catch (refreshError) {
      console.error('⚠️ Warning: Rankings refresh failed with exception:', refreshError);
      // Continue even if rankings refresh fails
    }

    // Log the points update for audit purposes
    console.log('✅ Points updated successfully:', {
      studentId,
      studentName: userData.name,
      oldPoints: currentPoints,
      pointsAdded: points,
      newPoints: newPoints,
      reason,
      timestamp: new Date().toISOString()
    });

    // Trigger n8n webhook for points update
    await triggerN8nWebhook('points', {
      studentId,
      studentName: userData.name,
      oldPoints: currentPoints,
      pointsAdded: points,
      newPoints: newPoints,
      reason,
      event: 'points_updated',
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Points updated successfully',
        data: {
          studentId,
          studentName: userData.name,
          oldPoints: currentPoints,
          pointsAdded: points,
          newPoints: newPoints,
          reason
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in update-user-points function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 