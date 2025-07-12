import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

    const { studentId, points, reason }: UpdatePointsRequest = await req.json();
    console.log('💰 Updating points for student:', studentId, 'points:', points, 'reason:', reason);

    if (!studentId || points === undefined || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studentId, points, or reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        JSON.stringify({ error: 'Failed to update user points' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh rankings to update top_students table
    console.log('🔄 Refreshing rankings...');
    const { error: refreshError } = await supabase.rpc('refresh_rankings');
    
    if (refreshError) {
      console.error('⚠️ Warning: Rankings refresh failed:', refreshError);
      // Don't fail the request if rankings refresh fails
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