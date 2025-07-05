import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  cc?: string[];
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      subject, 
      htmlBody, 
      plainTextBody, 
      cc, 
      replyTo, 
      fromName = "Shasun Honesty Shop",
      fromEmail 
    }: EmailRequest = await req.json();

    // Get Gmail credentials from Supabase secrets
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailClientId = Deno.env.get('GMAIL_CLIENT_ID');
    const gmailClientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
    const gmailRefreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');

    if (!gmailUser || !gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
      throw new Error('Gmail credentials not configured');
    }

    // Get access token from refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: gmailClientId,
        client_secret: gmailClientSecret,
        refresh_token: gmailRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Construct email
    const fromAddress = fromEmail || gmailUser;
    const emailHeaders = [
      `From: ${fromName} <${fromAddress}>`,
      `To: ${to}`,
      cc && cc.length > 0 ? `Cc: ${cc.join(', ')}` : '',
      replyTo ? `Reply-To: ${replyTo}` : '',
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"'
    ].filter(Boolean).join('\r\n');

    const emailBody = [
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      plainTextBody || htmlBody.replace(/<[^>]*>/g, ''),
      '',
      '--boundary123',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlBody,
      '',
      '--boundary123--'
    ].join('\r\n');

    const rawEmail = emailHeaders + emailBody;
    const encodedEmail = btoa(rawEmail).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send email via Gmail API
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    const gmailResult = await gmailResponse.json();

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${gmailResult.error?.message || 'Unknown error'}`);
    }

    console.log('Email sent successfully:', gmailResult);

    return new Response(JSON.stringify({
      success: true,
      messageId: gmailResult.id,
      message: 'Email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
