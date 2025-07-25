import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const DEFAULT_CONFIG = {
  app: {
    name: "College Honesty Shop",
    welcome_points: 100,
    tagline: "No Cameras 📷 | No Cashiers 💳 | Just Character 🫡",
    subtitle: "🛡️ Honor in Every Transaction 🤝",
    description: "A modern, secure, and ISO-compliant honesty shop management system built with enterprise-grade security and performance optimization."
  },
  branding: {
    college_name: "Your College Name",
    portal_name: "Your College Honesty Shop Portal",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f1f5f9"
    },
    logo: {
      url: "/logo.png",
      fallback: "https://cdn.jsdelivr.net/gh/lucide-icons/lucide@0.263.1/icons/graduation-cap.svg"
    },
    favicon: "/logo.png"
  },
  forms: {
    labels: {
      student_id: "Student ID",
      full_name: "Full Name",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      mobile_number: "Mobile Number",
      department: "Department",
      shift: "Shift",
      role: "Role",
      welcome_points: "Welcome Points"
    },
    placeholders: {
      student_id: "Enter your Student ID",
      full_name: "Enter your full name",
      email: "Enter your email",
      password: "Enter your password",
      confirm_password: "Confirm your password",
      mobile_number: "Enter your mobile number"
    },
    shift_options: [
      { value: "Morning (1st Shift)", label: "Morning (1st Shift)" },
      { value: "Evening (2nd Shift)", label: "Evening (2nd Shift)" },
      { value: "Full Shift", label: "Full Shift" }
    ],
    role_options: [
      { value: "student", label: "Student" },
      { value: "teacher", label: "Teacher" }
    ]
  },
  messages: {
    auth: {
      login_description: "Enter your Student ID and password to access the portal",
      signup_description: "Create your account to access the portal",
      login_button: "Sign In 🚀",
      signup_button: "Create Account 🚀",
      welcome_back: "Welcome back! 🎉",
      account_created: "Account created! 🎉",
      sign_in_success: "You're successfully logged in!",
      fill_all_fields: "Please fill in all required fields",
      errors: {
        missing_student_id: "Student ID is required",
        student_id_alphanumeric: "Only letters and numbers allowed",
        missing_credentials: "Password is required",
        password_min_length: "Password must be at least 6 characters",
        ensure_passwords_match: "Passwords do not match",
        session_expired: "Session expired, please login again",
        login_failed: "Login failed"
      }
    },
    navigation: {
      header_title: "College Honesty Shop",
      notifications: "Notifications",
      no_notifications: "No notifications"
    },
    products: {
      no_products: "No products available",
      out_of_stock: "Out of Stock",
      add_to_cart: "Add to Cart",
      total: "Total",
      check_back: "Check back later for new products",
      loading_products: "Loading products..."
    },
    errors: {
      all_fields_required: "All fields required",
      fill_all_fields: "Please fill in all required fields",
      passwords_dont_match: "Passwords don't match",
      password_too_short: "Password too short",
      missing_credentials: "Missing credentials",
      login_failed: "Login failed",
      signup_failed: "Signup failed",
      student_id_alphanumeric: "Only letters and numbers are allowed",
      student_id_not_found: "Student ID not found",
      session_expired: "Session expired, please login again",
      network_error: "Network error, please try again",
      missing_student_id: "Student ID is required",
      password_min_length: "Password must be at least 6 characters",
      ensure_passwords_match: "Please ensure passwords match",
      failed_to_load_image: "Failed to load image",
      failedToLoadStockOperations: "Failed to load stock operations",
      failedToSaveStockOperations: "Failed to save stock operations"
    },
    loading: {
      signing_in: "Signing in... ⏳",
      creating_account: "Creating Account... ⏳",
      loading_products: "Loading products...",
      loading_image: "Loading image..."
    },
    success: {
      password_reset_sent: "Password Reset",
      reset_link_sent: "Password reset link sent to:"
    }
  },
  system: {
    performance: {
      cache_timeout: 300000,
      max_login_attempts: 5,
      session_timeout: 86400000,
      image_retry_attempts: 3,
      image_retry_delay: 1000
    },
    security: {
      enable_csrf_protection: true,
      enable_xss_protection: true,
      enable_rate_limiting: true,
      session_validation_interval: 300000,
      audit_log_retention: 7776000000
    },
    iso_compliance: {
      enable_audit_logging: true,
      enable_performance_monitoring: true,
      enable_security_monitoring: true,
      enable_quality_assurance: true,
      compliance_check_interval: 86400000
    }
  },
  SECURITY: {
    session_validation_interval: 300000
  },
  badge_images: {
    achievement_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/award.svg",
    honor_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/trophy.svg",
    excellence_badge: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/star.svg"
  },
  admin: {
    access_note: "Super Admin Access: Check with Radhika"
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Fetch config from whitelabel_config table
      let row;
      const { data, error } = await supabase
        .from('whitelabel_config')
        .select('id, config')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      row = data;

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch config' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If no config exists, insert default
      if (!row) {
        const { data: inserted, error: insertError } = await supabase
          .from('whitelabel_config')
          .insert([{ config: DEFAULT_CONFIG }])
          .select('id, config')
          .single();
        if (insertError) {
          return new Response(
            JSON.stringify({ error: 'Failed to insert default config' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        row = inserted;
      }

      return new Response(
        JSON.stringify(row.config),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const config = await req.json();
      // Validate config structure
      if (!config || typeof config !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Invalid config format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Update the config row (assume only one row)
      const { data: row, error } = await supabase
        .from('whitelabel_config')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch config row' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!row) {
        // Insert if not exists
        const { error: insertError } = await supabase
          .from('whitelabel_config')
          .insert([{ config }]);
        if (insertError) {
          return new Response(
            JSON.stringify({ error: 'Failed to insert config' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Update existing
        const { error: updateError } = await supabase
          .from('whitelabel_config')
          .update({ config, updated_at: new Date().toISOString() })
          .eq('id', row.id);
        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update config' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Config updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in whitelabel config function:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 