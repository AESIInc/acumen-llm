import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  try {
    const supabase = await createClient();
    
    // Sign in anonymously with Supabase
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Failed to create anonymous session:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Redirect to the originally requested URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Guest authentication error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
} 