import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { i18n, LanguageType, Locale } from "./i18n.config"

// Define paths that don't require authentication
const authenticationExemptPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password/request',
  '/auth/callback',
  '/auth/confirm',
]

// Function to get the preferred locale from the request
function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))
  
  const locales: LanguageType[] = i18n.locales
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  
  try {
    return matchLocale(languages, locales, i18n.defaultLocale)
  } catch (error) {
    return i18n.defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  // Create response with headers setup
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)
  
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const { pathname, search } = request.nextUrl
  
  // Check if the pathname already includes a locale
  const pathnameHasLocale = i18n.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // Get locale from pathname or from the accept-language header
  let locale = pathnameHasLocale ? pathname.split('/')[1] as Locale : getLocale(request) as Locale
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
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

  // Redirect if there is no locale in the pathname
  if (!pathnameHasLocale) {
    // Create a URL with the detected locale
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    url.search = search
    return NextResponse.redirect(url)
  }

  // Get the path without the locale prefix for auth checks
  const pathWithoutLocale = pathname.replace(`/${locale}`, '')

  // if (user) {
  //   // If user is logged in and trying to access auth pages, redirect to home
  //   if (authenticationExemptPaths.includes(pathWithoutLocale)) {
  //     const url = request.nextUrl.clone()
  //     url.pathname = `/${locale}/`
  //     return NextResponse.redirect(url)
  //   }
  // } else {
  //   // If user is not logged in and the path requires authentication, redirect to login
  //   const isAuthExempt = authenticationExemptPaths.includes(pathWithoutLocale) || pathWithoutLocale === '/'
    
  //   if (!isAuthExempt) {
  //     const url = request.nextUrl.clone()
  //     url.pathname = `/${locale}/auth/login`
  //     // Store original URL as redirect parameter
  //     url.searchParams.set('redirectedFrom', pathname)
  //     return NextResponse.redirect(url)
  //   }
  // }

  // Add the locale to headers
  requestHeaders.set('x-locale', locale)
  
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}