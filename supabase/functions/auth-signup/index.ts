import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  studentId: string;
  name: string;
  department: string;
  email: string;
  password: string;
  role?: string;
  shift?: string;
  points?: number;
}

const handler = async (req: Request): Promise<Response> => {
  const traceId = crypto.randomUUID();
  const log = (...args: unknown[]) => console.log(`[trace:${traceId}]`, ...args);

  log("🔐 Signup function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      log("❌ Missing env vars for Supabase");
      return new Response(
        JSON.stringify({ error: "Internal server error: misconfigured env vars." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      log("❌ Invalid content-type:", contentType);
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const {
      studentId,
      name,
      department,
      email,
      password,
      role = "student",
      shift = "1",
      points = 100
    } = (await req.json()) as SignupRequest;

    log("📥 Incoming Payload:", {
      studentId,
      name,
      department,
      email,
      shift,
      role,
      points,
      origin: req.headers.get("origin"),
      ip: req.headers.get("x-forwarded-for")
    });

    if (!studentId || !name || !department || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validShifts = ['Morning (1st Shift)', 'Evening (2nd Shift)', 'Full Shift'];
    if (shift && !validShifts.includes(shift)) {
      return new Response(
        JSON.stringify({ error: "Invalid shift value." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("student_id")
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingError) {
      log("❌ DB check failed:", existingError);
      return new Response(
        JSON.stringify({ error: "Database error checking student ID." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (existingUser) {
      log("❌ Duplicate student ID:", studentId);
      return new Response(
        JSON.stringify({ error: "Student ID already exists." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: existingAuthUsers, error: authListError } = await supabase.auth.admin.listUsers();
    if (authListError) {
      log("❌ Auth listing error:", authListError);
      return new Response(
        JSON.stringify({ error: "Auth validation failed." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailExists = existingAuthUsers.users.some((u) => u.email === email);

    if (emailExists) {
      log("❌ Email already in use:", email);
      return new Response(
        JSON.stringify({ error: "Email already exists." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("🧑‍💻 Creating Supabase auth user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { student_id: studentId, name, department, role }
    });

    if (authError || !authData?.user?.id) {
      log("❌ Auth user creation failed:", authError);
      return new Response(
        JSON.stringify({ error: authError?.message || "Auth creation failed." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("✅ Auth user created:", authData.user.id);

    const { data: existingPublicUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (existingPublicUser) {
      log("⚠️ User already exists in users table");
      return new Response(
        JSON.stringify({ message: "User already exists", user: { id: authData.user.id } }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        student_id: studentId,
        name,
        department,
        email,
        role,
        shift,
        points,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_signed_in_at: new Date().toISOString()
      });

    if (insertError) {
      log("❌ Failed inserting into users table:", insertError);

      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        log("🗑️ Rolled back auth user");
      } catch (rbErr) {
        log("❌ Rollback failed:", rbErr);
      }

      return new Response(
        JSON.stringify({ error: "Failed inserting into users table." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("🎉 User signup complete:", authData.user.id);

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        user: { id: authData.user.id, email: authData.user.email }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("❌ Fatal error in signup function:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
