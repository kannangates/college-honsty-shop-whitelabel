import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, continue with the request
  if (!session) {
    return response;
  }

  // Skip MFA check for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    return response;
  }

  try {
    // Check if MFA is enabled for the user
    const { data: mfaData, error } = await supabase
      .from('user_mfa')
      .select('enabled')
      .eq('user_id', session.user.id)
      .single();

    // If MFA is enabled and the user hasn't verified yet
    if (mfaData?.enabled && !request.cookies.get('mfa_verified')) {
      // Don't redirect if we're already on the MFA verification page
      if (!request.nextUrl.pathname.startsWith('/verify-mfa')) {
        const verifyUrl = new URL('/verify-mfa', request.url);
        // Store the intended URL to redirect back after MFA verification
        verifyUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(verifyUrl);
      }
    }
  } catch (error) {
    console.error('MFA middleware error:', error);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
