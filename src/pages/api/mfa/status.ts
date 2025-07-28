import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { isMFAEnabled } from '@/lib/mfa-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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
    console.log(`Checking MFA status for user: ${userId}`);
    
    // Check if MFA is enabled for the user
    const enabled = await isMFAEnabled(userId);
    
    console.log(`MFA status for user ${userId}: ${enabled ? 'enabled' : 'disabled'}`);

    res.status(200).json({
      success: true,
      data: {
        enabled,
        userId
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MFA status check error:', errorMessage, error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to check MFA status',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
