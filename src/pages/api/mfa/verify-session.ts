import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { verifyMFAToken, isMFAEnabled } from '@/lib/mfa-utils';

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

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'A valid token is required' 
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

    const userId = session.user.id;
    console.log(`Verifying MFA session for user: ${userId}`);

    // First check if MFA is enabled for the user
    const mfaEnabled = await isMFAEnabled(userId);
    if (!mfaEnabled) {
      console.log(`MFA not enabled for user: ${userId}, skipping verification`);
      return res.status(200).json({
        success: true,
        data: {
          verified: true,
          mfaRequired: false,
          message: 'MFA not enabled for this account'
        }
      });
    }

    console.log(`Verifying MFA token for user: ${userId}`);
    
    // Verify the token
    const isValid = await verifyMFAToken(userId, token);

    if (!isValid) {
      console.warn(`Invalid MFA token provided for user: ${userId}`);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }

    // Set a secure, HTTP-only cookie to indicate MFA verification
    // 8 hours expiration for the MFA verification
    const cookieExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
    
    res.setHeader('Set-Cookie', [
      `mfa_verified=true; Path=/; Expires=${cookieExpiry.toUTCString()}; HttpOnly; Secure; SameSite=Strict`,
      `mfa_user_id=${userId}; Path=/; Expires=${cookieExpiry.toUTCString()}; HttpOnly; Secure; SameSite=Strict`
    ]);
    
    console.log(`MFA verification successful for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      data: {
        verified: true,
        mfaRequired: true,
        userId,
        message: 'MFA verification successful'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MFA session verification error:', errorMessage, error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify MFA session',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
