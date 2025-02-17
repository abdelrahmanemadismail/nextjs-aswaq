import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// // Define paths that don't require phone verification
// const phoneVerificationExemptPaths = [
//   '/',
//   '/auth/login',
//   '/auth/signup',
//   '/auth/reset-password',
//   '/auth/reset-password/request',
//   '/auth/callback',
//   '/auth/confirm',
//   '/auth/phone-verification',
// ]

// Define paths that don't require authentication
const authenticationExemptPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password/request',
  '/auth/callback',
  '/auth/confirm',
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Don't add any code between here and auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentPath = request.nextUrl.pathname
  // const requiresPhoneVerification = !phoneVerificationExemptPaths.includes(currentPath)
  

  if (user) {
    if (authenticationExemptPaths.includes(currentPath)) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    // If user exists and path requires phone verification, check if phone is verified
  //   if (requiresPhoneVerification && !user.phone_confirmed_at) {
  //     const url = request.nextUrl.clone()
  //     url.pathname = '/auth/phone-verification'
  //     // Store original URL as redirect parameter
  //     url.searchParams.set('redirectedFrom', currentPath)
  //     return NextResponse.redirect(url)
  //   }
  // } else if (
  //   !phoneVerificationExemptPaths.includes(currentPath)
  // ) {
  //   // No user and path requires authentication, redirect to login
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/login'
  //   url.searchParams.set('redirectedFrom', currentPath)
  //   return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}