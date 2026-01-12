
// supabase/functions/auth-login/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authLoginSchema } from "../_shared/schemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const requestBody = await req.json();
    const validationResult = authLoginSchema.safeParse(requestBody);

    if (!validationResult.success) {
      type ZodIssue = { path: Array<string | number>; message: string };
      const issues = (validationResult as unknown as { error: { issues: ZodIssue[] } }).error.issues as ZodIssue[];
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: issues.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { studentId, password } = validationResult.data;
    console.log("🔑 Login attempt for student ID:", studentId);

    // 3) Lookup in your 'users' table by student_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, student_id, name, department")
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

    // 5) Verify role from user_roles table for security-critical operations
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.id)
      .single();

    if (roleError) {
      console.log("⚠️ Role verification failed:", roleError.message);
      // Continue with default role but log the issue
    }

    const verifiedRole = roleData?.role || 'student'; // Default to student if role verification fails

    // 6) Update last signed in time
    await supabase
      .from("users")
      .update({ last_signed_in_at: new Date().toISOString() })
      .eq("id", userData.id);

    // 7) Return the session and user info with verified role
    return new Response(
      JSON.stringify({
        message: "Login successful",
        session: authData.session,
        user: {
          id: userData.id,
          email: userData.email,
          student_id: userData.student_id,
          name: userData.name,
          role: verifiedRole, // Use verified role from user_roles table
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
