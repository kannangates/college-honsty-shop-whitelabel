
// supabase/functions/auth-login/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginRequest {
  studentId: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 Login function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1) Create supabase client with service role
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("❌ Missing env vars for Supabase URL or Service Role Key");
      return new Response(
        JSON.stringify({ error: "Internal server error: misconfigured env vars." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 2) Parse request body
    const { studentId, password } = (await req.json()) as LoginRequest;
    console.log("🔑 Login attempt for student ID:", studentId);

    if (!studentId || !password) {
      return new Response(
        JSON.stringify({ error: "Missing studentId or password." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3) Lookup in your 'users' table by student_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, student_id, name, role, department")
      .eq("student_id", studentId)
      .single();

    if (userError || !userData) {
      console.log("❌ Student ID not found:", userError?.message);
      return new Response(
        JSON.stringify({
          error: "Student ID not found. Please check your student ID or contact admin.",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("📧 Found user with email:", userData.email);

    // 4) Sign in with Supabase Auth (email + password)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    });

    if (authError || !authData.session) {
      console.log("❌ Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid password. Please check your credentials." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✅ Login successful for user:", userData.email);

    // 5) Update last signed in time
    await supabase
      .from("users")
      .update({ last_signed_in_at: new Date().toISOString() })
      .eq("id", userData.id);

    // 6) Return the session and user info
    return new Response(
      JSON.stringify({
        message: "Login successful",
        session: authData.session,
        user: { 
          id: userData.id, 
          email: userData.email, 
          student_id: userData.student_id,
          name: userData.name,
          role: userData.role,
          department: userData.department
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("❌ Login function error:", error);
    let message = "Unknown error";

    if (error instanceof Error) {
      message = error.message;
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
