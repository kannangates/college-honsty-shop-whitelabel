
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { captchaVerificationSchema } from '../_shared/schemas.ts';

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
    const requestBody = await req.json();

    // Validate input with Zod schema
    const validationResult = captchaVerificationSchema.safeParse(requestBody);
    if (!validationResult.success) {
      type ZodIssue = { path: Array<string | number>; message: string };
      const issues = (validationResult as unknown as { error: { issues: ZodIssue[] } }).error.issues as ZodIssue[];
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: issues.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token, secretKey } = validationResult.data;

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
