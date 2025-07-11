
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ForgotPasswordRequest {
  studentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      hasSiteUrl: !!siteUrl
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { studentId }: ForgotPasswordRequest = await req.json();
    console.log('Password reset request for student ID:', studentId);

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'Student ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by student ID
    console.log('Looking up user with student ID:', studentId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name, student_id')
      .eq('student_id', studentId)
      .single();

    if (userError) {
      console.error('Database error looking up user:', userError);
      
      // Check if it's a "not found" error vs a real database error
      if (userError.code === 'PGRST116') {
        console.log('No user found with student ID:', studentId);
        return new Response(
          JSON.stringify({ 
            error: `Student ID "${studentId}" not found in our records. Please check your student ID and try again, or contact your administrator if you believe this is an error.` 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Database error occurred. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.log('No user found with student ID:', studentId);
      return new Response(
        JSON.stringify({ 
          error: `Student ID "${studentId}" not found in our records. Please check your student ID and try again, or contact your administrator if you believe this is an error.` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found user, sending reset email to:', user.email);

    // Send password reset email using Supabase Auth
    const redirectUrl = siteUrl ? `${siteUrl}/reset-password` : 'http://localhost:3000/reset-password';
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: redirectUrl
    });

    if (resetError) {
      console.error('Password reset error:', resetError);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to send reset email. Please try again later or contact support.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Password reset email sent successfully');

    // Mask email for response
    const maskEmail = (email: string) => {
      const [local, domain] = email.split('@');
      if (!local || !domain) return email;
      if (local.length <= 4) {
        return local[0] + '**' + local.slice(-1) + '@' + domain;
      }
      return local.slice(0, 2) + '**' + local.slice(-2) + '@' + domain;
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: maskEmail(user.email),
        message: 'Password reset link sent to your email'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in forgot-password function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
