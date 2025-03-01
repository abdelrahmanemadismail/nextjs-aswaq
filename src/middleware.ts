import { NextResponse, type NextRequest } from 'next/server'
import { i18n, LanguageType, Locale } from "./i18n.config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { Languages } from '@/constants/enums'
import { createServerClient } from '@supabase/ssr'

// Helper function to get the preferred locale from the request
function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: LanguageType[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  let locale = "";

  try {
    locale = matchLocale(languages, locales, i18n.defaultLocale);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  } catch (error: any) {
    locale = i18n.defaultLocale;
  }
  return locale;
}
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);


  // Step 1: Check if the pathname has a supported locale
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = i18n.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Step 2: Redirect if there is no locale in the pathname
  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    const url = new URL(`/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`, request.url)
    url.search = request.nextUrl.search
    
    return NextResponse.redirect(url)
  }
  
  // Get the current locale from the URL
  const pathnameParts = pathname.split('/')
  const currentLocale = pathnameParts.length > 1 ? pathnameParts[1] : null
  
  // Step 3: Process Supabase authentication
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Step 4: Check auth and redirect for protected routes if needed
  // Get the path without the locale prefix for easier checks
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${currentLocale}`), '')
  
  const publicPaths = ['', '/about-us', '/contact', '/terms-of-service', '/privacy-policy']
  const pathStartsWithPublic = ['/help', '/auth', '/listings','/sell']
  
  const isPublicPath = 
    publicPaths.includes(pathWithoutLocale) || 
    pathStartsWithPublic.some(p => pathWithoutLocale.startsWith(p))
  
  if (!user && !isPublicPath) {
    // No user and trying to access protected route
    // Redirect to login page with the correct locale
    const url = request.nextUrl.clone()
    url.pathname = `/${currentLocale}/auth/login`
    url.search = `?redirectTo=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files, etc.)
    '/((?!_next|api|favicon.ico|images|.*\\.png$|.*\\.svg$).*)',
  ]
}