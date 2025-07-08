
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  mobileNumber?: string;
  role?: string;
  shift?: string;
  points?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 Signup function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("❌ Missing env vars for Supabase");
      return new Response(
        JSON.stringify({ error: "Internal server error: misconfigured env vars." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const {
      studentId,
      name,
      department,
      email,
      password,
      mobileNumber,
      role,
      shift,
      points,
    } = (await req.json()) as SignupRequest;

    console.log("📝 Signup attempt:", { studentId, name, department, email, shift });

    if (!studentId || !name || !department || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate shift value
    const validShifts = ['Morning (1st Shift)', 'Evening (2nd Shift)', 'Full Shift'];
    if (shift && !validShifts.includes(shift)) {
      return new Response(
        JSON.stringify({ error: "Invalid shift value. Must be 'Morning (1st Shift)', 'Evening (2nd Shift)', or 'Full Shift'." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if student_id already exists in public.users
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("student_id")
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingError) {
      console.error("❌ DB error when checking existing user:", existingError);
      return new Response(
        JSON.stringify({ error: "Database error. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    if (existingUser) {
      console.log("❌ Student ID already exists");
      return new Response(
        JSON.stringify({ error: "Student ID already exists" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if email already exists in auth.users
    const { data: existingAuthUsers, error: authListError } = await supabase.auth.admin.listUsers();
    if (authListError) {
      console.error("❌ Error checking existing auth users:", authListError);
      return new Response(
        JSON.stringify({ error: "Failed to validate email uniqueness" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    type AuthUser = { email: string };
const emailExists = existingAuthUsers?.users?.some((user: AuthUser) => user.email === email);

    if (emailExists) {
      console.log("❌ Email already exists in auth.users");
      return new Response(
        JSON.stringify({ error: "Email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the auth user using admin API with email confirmation disabled
    console.log("📤 Creating auth user with:", {
      email,
      passwordLength: password?.length,
      studentId,
      name,
      department,
      role: role ?? "student",
    });    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        student_id: studentId,
        name: name,
        department: department,
        role: role ?? "student",
      },
    });

    if (authError || !authData?.user?.id) {
  console.error("❌ Auth creation failed:", {
    message: authError?.message,
    status: authError?.status,
    userData: authData,
  });

  return new Response(
    JSON.stringify({ error: authError?.message || "Auth user creation failed" }),
    { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

    console.log("✅ Auth user created:", authData.user.id);

    // Check if user already exists in public.users with this auth ID
    const { data: existingPublicUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (existingPublicUser) {
      console.log("⚠️ User already exists in public.users table, skipping insert");
      return new Response(
        JSON.stringify({
          message: "User already exists",
          user: { id: authData.user.id, email: authData.user.email },
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert into public.users table
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          student_id: studentId,
          name: name,
          department: department,
          email: email,
          mobile_number: mobileNumber ?? null,
          role: role ?? "student",
          shift: shift ?? "1",
          points: points ?? 100,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_signed_in_at: new Date().toISOString(),
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("❌ Failed to insert into users table:", insertError);
      console.error("❌ Insert error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // Roll back the Auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log("🔄 Rolled back auth user due to failed public.users insert");
      } catch (rollbackError) {
        console.error("❌ Failed to rollback auth user:", rollbackError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Database error creating new user", 
          details: insertError.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("📥 Inserted new user into public.users:", insertedUser?.id || authData.user.id);

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: { id: authData.user.id, email: authData.user.email },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("❌ Signup function error:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
