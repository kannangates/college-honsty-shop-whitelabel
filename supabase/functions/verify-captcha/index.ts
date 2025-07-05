
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptchaVerificationRequest {
  token: string;
  secretKey: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, secretKey }: CaptchaVerificationRequest = await req.json();

    if (!token || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Token and secret key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify with hCaptcha
    const verificationData = new FormData();
    verificationData.append('secret', secretKey);
    verificationData.append('response', token);

    const verificationResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      body: verificationData,
    });

    const verificationResult = await verificationResponse.json();

    return new Response(
      JSON.stringify({ 
        success: verificationResult.success,
        error: verificationResult['error-codes'] || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Captcha verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
