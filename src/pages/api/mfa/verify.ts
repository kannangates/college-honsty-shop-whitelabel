import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { verifyMFAToken, enableMFA } from '@/lib/mfa-utils';

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

    console.log(`MFA token verified for user: ${userId}, enabling MFA...`);
    
    // If valid, enable MFA for the user
    const enabled = await enableMFA(userId);
    
    if (!enabled) {
      throw new Error('Failed to enable MFA after verification');
    }

    console.log(`MFA successfully enabled for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        message: 'MFA has been enabled successfully',
        enabled: true
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MFA verification error:', errorMessage, error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify MFA token',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
