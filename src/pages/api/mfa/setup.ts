import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { generateMFASecret, generateQRCode } from '@/lib/mfa-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    });
  }

  try {
    // Get the session using the server-side supabase client
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('Authentication error:', sessionError?.message || 'No session found');
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }
    
    if (!session.user.email) {
      return res.status(400).json({
        success: false,
        error: 'User email is required for MFA setup'
      });
    }

    if (!session.user.email) {
      return res.status(400).json({
        success: false,
        error: 'User email is required for MFA setup'
      });
    }

    console.log(`Initiating MFA setup for user: ${session.user.id}`);
    
    // Generate MFA secret and get OTPAuth URL
    const { secret, otpauthUrl } = await generateMFASecret(
      session.user.id,
      session.user.email
    );

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);
    
    console.log(`MFA setup completed for user: ${session.user.id}`);

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCode,
        otpauthUrl
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MFA setup error:', errorMessage, error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to set up MFA',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
