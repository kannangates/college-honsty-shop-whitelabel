import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { disableMFA } from '@/lib/mfa-utils';

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

    const userId = session.user.id;
    console.log(`Disabling MFA for user: ${userId}`);
    
    // Disable MFA for the user
    const disabled = await disableMFA(userId);
    
    if (!disabled) {
      throw new Error('Failed to disable MFA');
    }

    // Clear any MFA verification cookies
    res.setHeader('Set-Cookie', [
      'mfa_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
    ]);

    console.log(`MFA successfully disabled for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        message: 'MFA has been disabled successfully',
        disabled: true
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MFA disable error:', errorMessage, error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to disable MFA',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
