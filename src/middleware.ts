import { NextResponse, type NextRequest } from 'next/server'
import { i18n, LanguageType } from "./i18n.config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { createServerClient } from '@supabase/ssr'

// Helper function to get the preferred locale from the request
function getLocale(request: NextRequest): string | undefined {
  // First check if there's a language cookie
  const languageCookie = request.cookies.get('preferred-language')?.value
  if (languageCookie && i18n.locales.includes(languageCookie as LanguageType)) {
    return languageCookie
  }

  // Fall back to negotiator
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Check for language switch parameter in URL
  const url = new URL(request.url)
  const switchLangParam = url.searchParams.get('setLang')

  // Step 1: Check if the pathname has a supported locale
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = i18n.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Extract current locale from path if present
  const pathnameParts = pathname.split('/')
  const currentLocale = pathnameParts.length > 1 ? pathnameParts[1] : null
  
  // Handle language switch if setLang parameter is present
  if (switchLangParam && i18n.locales.includes(switchLangParam as LanguageType)) {
    // Create a response to redirect to the same page but without the setLang param
    const newUrl = new URL(request.url)
    newUrl.searchParams.delete('setLang')
    const response = NextResponse.redirect(newUrl)
    
    // Set cookie for the new language preference (1 year expiry)
    response.cookies.set('preferred-language', switchLangParam, { 
      maxAge: 60 * 60 * 24 * 365,
      path: '/'
    })
    
    return response
  }

  // Step 2: Redirect if there is no locale in the pathname
  if (!pathnameHasLocale) {
    // Priority: 1. User metadata if logged in, 2. Cookie, 3. Browser preference
    const locale = user?.user_metadata.preferred_language || getLocale(request)
    const url = new URL(`/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`, request.url)
    url.search = request.nextUrl.search
    
    const response = NextResponse.redirect(url)
    
    // Also set cookie if we're using a locale from user metadata
    if (user?.user_metadata.preferred_language) {
      response.cookies.set('preferred-language', user.user_metadata.preferred_language, { 
        maxAge: 60 * 60 * 24 * 365,
        path: '/'
      })
    }
    
    return response
  }
  
  // Step 3: Process Supabase authentication
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Step 4: Check auth and redirect for protected routes if needed
  // Get the path without the locale prefix for easier checks
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${currentLocale}`), '')
  
  const publicPaths = ['', '/about-us', '/terms-of-service', '/privacy-policy']
  const pathStartsWithPublic = ['/help', '/auth', '/listings', '/contact', '/sell']
  
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