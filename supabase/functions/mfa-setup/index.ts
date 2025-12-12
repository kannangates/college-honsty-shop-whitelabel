import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface MFASetupRequest {
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate MFA secret using Web Crypto API
    const secret = generateBase32Secret()
    const email = user.email || user.user_metadata?.email || 'user@example.com'

    // Create OTP Auth URL
    const issuer = 'Shasun College'
    const accountName = `${issuer}:${email}`
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`

    // Generate QR code data URL
    const qrCode = await generateQRCodeDataURL(otpauthUrl)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Store the secret in the database (not yet enabled)
    const { error: dbError } = await supabaseAdmin
      .from('user_mfa')
      .upsert({
        user_id: user.id,
        secret: secret,
        enabled: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store MFA secret' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        secret,
        qrCode,
        otpauthUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('MFA setup error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Generate a base32 secret for TOTP
function generateBase32Secret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  const array = new Uint8Array(20)
  crypto.getRandomValues(array)

  for (let i = 0; i < array.length; i++) {
    secret += chars[array[i] % chars.length]
  }

  return secret
}

// Generate QR code as data URL
async function generateQRCodeDataURL(text: string): Promise<string> {
  // Simple QR code generation - in production, you might want to use a proper QR library
  // For now, we'll return a placeholder that works with most QR code libraries
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`

  try {
    const response = await fetch(qrApiUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('QR code generation error:', error)
    // Return a simple data URL that can be used as fallback
    return `data:text/plain;base64,${btoa(text)}`
  }
}