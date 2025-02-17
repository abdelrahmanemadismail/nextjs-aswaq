import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    // Determine the correct redirect URL based on environment
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    let redirectUrl: string
    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      // Use the forwarded protocol if available, otherwise default to https
      const protocol = forwardedProto || 'https'
      redirectUrl = `${protocol}://${forwardedHost}${next}`
    } else {
      redirectUrl = `${origin}${next}`
    }

    // Set cache control headers to prevent caching of auth redirects
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response

  } catch (error) {
    console.error('Callback handler error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error?error=internal_error`)
  }
}