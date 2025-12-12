import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface MFAVerifySessionRequest {
  token: string;
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

    const { token: mfaToken }: MFAVerifySessionRequest = await req.json()

    if (!mfaToken) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the user's MFA secret
    const { data: mfaData, error: mfaError } = await supabaseAdmin
      .from('user_mfa')
      .select('secret, enabled')
      .eq('user_id', user.id)
      .single()

    if (mfaError || !mfaData) {
      return new Response(
        JSON.stringify({ error: 'MFA not set up for this user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!mfaData.enabled) {
      return new Response(
        JSON.stringify({ error: 'MFA is not enabled for this user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the TOTP token
    const sanitizedToken = mfaToken.replace(/\s+/g, '')
    const isValid = await verifyTOTP(sanitizedToken, mfaData.secret)

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'MFA verified successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('MFA session verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// TOTP verification function (same as in mfa-verify)
async function verifyTOTP(token: string, secret: string, window: number = 1): Promise<boolean> {
  const timeStep = 30 // 30 seconds
  const currentTime = Math.floor(Date.now() / 1000)

  // Check current time and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const timeCounter = Math.floor((currentTime + i * timeStep) / timeStep)
    const expectedToken = await generateTOTP(secret, timeCounter)

    if (expectedToken === token) {
      return true
    }
  }

  return false
}

// Generate TOTP token (same as in mfa-verify)
async function generateTOTP(secret: string, timeCounter: number): Promise<string> {
  // Convert base32 secret to bytes
  const secretBytes = base32ToBytes(secret)

  // Convert time counter to 8-byte array
  const timeBytes = new ArrayBuffer(8)
  const timeView = new DataView(timeBytes)
  timeView.setUint32(4, timeCounter, false) // Big-endian

  // HMAC-SHA1
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, timeBytes)
  const signatureArray = new Uint8Array(signature)

  // Dynamic truncation
  const offset = signatureArray[19] & 0xf
  const code = (
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff)
  ) % 1000000

  return code.toString().padStart(6, '0')
}

// Convert base32 string to bytes (same as in mfa-verify)
function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''

  for (const char of base32.toUpperCase()) {
    const index = alphabet.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, '0')
  }

  const bytes = []
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8)
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2))
    }
  }

  return new Uint8Array(bytes)
}