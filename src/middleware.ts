import { NextResponse, type NextRequest } from 'next/server'
import { i18n, LanguageType } from "./i18n.config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { createServerClient } from '@supabase/ssr'

// Extend NextRequest to include geo information
type NextRequestWithGeo = NextRequest & {
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
};

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

// Helper function to validate country slug
async function validateCountrySlug(supabase: ReturnType<typeof createServerClient>, slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id')
      .eq('type', 'country')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error validating country slug:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Exception validating country slug:', error)
    return false
  }
}

// Helper function to get country from IP
async function getCountryFromIP(request: NextRequestWithGeo, supabase: ReturnType<typeof createServerClient>): Promise<string | null> {
  try {
    // Debug: Log the geo information
    console.log('=== COUNTRY DETECTION DEBUG ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('request.geo:', request.geo)

    // Vercel Edge Functions provide the user's country.
    // In development, `request.geo` is not available, so we'll use a default.
    const countryCode = (process.env.NODE_ENV === 'development')
      ? 'ae' // Default to UAE in development
      : request.geo?.country?.toLowerCase();

    console.log('Detected country code:', countryCode)

    if (!countryCode) {
      console.warn("Could not determine country from geo headers. User will need to select a country manually.");
      return null;
    }

    // Get country slug from Supabase based on country code
    const { data: countryData, error } = await supabase
      .from('locations')
      .select('slug, name')
      .eq('type', 'country')
      .eq('code', countryCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching country from database:', error)
      return null
    }

    console.log('Found country data:', countryData)
    return countryData?.slug || null
  } catch (error) {
    console.error('Error getting country from IP:', error)
    return null
  }
}

export async function middleware(request: NextRequestWithGeo) {
  console.log('=== MIDDLEWARE START ===')
  console.log('Request URL:', request.url)
  console.log('Request pathname:', request.nextUrl.pathname)

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);

  // Check for existing country preference BEFORE creating Supabase client
  const preferredCountry = request.cookies.get('preferred-country')?.value
  console.log('Existing preferred-country cookie:', preferredCountry)

  // Initialize response variable
// eslint-disable-next-line prefer-const
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  console.log('User authenticated:', !!user)

  // If no preferred country is set, try to get it from IP and set cookie
  if (!preferredCountry) {
    console.log('No preferred country found, attempting IP detection...')
    const countrySlug = await getCountryFromIP(request, supabase)

    if (countrySlug) {
      console.log('Setting country cookie to:', countrySlug)

      // Set the cookie on the response
      response.cookies.set('preferred-country', countrySlug, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      console.log('Country cookie set successfully')
    } else {
      console.log('Could not detect country from IP')
    }
  } else {
    console.log('Using existing preferred country:', preferredCountry)
  }

  // Check for language switch parameter in URL
  const url = new URL(request.url)
  const switchLangParam = url.searchParams.get('setLang')
  const switchCountryParam = url.searchParams.get('setCountry')

  // Handle country switch if setCountry parameter is present
  if (switchCountryParam) {
    console.log('Country switch requested:', switchCountryParam)
    const isValidCountry = await validateCountrySlug(supabase, switchCountryParam)

    if (isValidCountry) {
      console.log('Valid country, redirecting and setting cookie')
      // Create a response to redirect to the same page but without the setCountry param
      const newUrl = new URL(request.url)
      newUrl.searchParams.delete('setCountry')
      const countrySwitchResponse = NextResponse.redirect(newUrl)

      // Set cookie for the new country preference (1 year expiry)
      countrySwitchResponse.cookies.set('preferred-country', switchCountryParam, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      return countrySwitchResponse
    } else {
      console.log('Invalid country slug:', switchCountryParam)
    }
  }

  // Step 1: Check if the pathname has a supported locale
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = i18n.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Extract current locale from path if present
  const pathnameParts = pathname.split('/')
  const currentLocale = pathnameParts.length > 1 ? pathnameParts[1] : null

  console.log('Pathname has locale:', pathnameHasLocale)
  console.log('Current locale:', currentLocale)

  // Handle language switch if setLang parameter is present
  if (switchLangParam && i18n.locales.includes(switchLangParam as LanguageType)) {
    console.log('Language switch requested:', switchLangParam)
    // Create a response to redirect to the same page but without the setLang param
    const newUrl = new URL(request.url)
    newUrl.searchParams.delete('setLang')
    const langSwitchResponse = NextResponse.redirect(newUrl)

    // Set cookie for the new language preference (1 year expiry)
    langSwitchResponse.cookies.set('preferred-language', switchLangParam, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return langSwitchResponse
  }

  // Step 2: Redirect if there is no locale in the pathname
  // Skip locale redirect for sitemap.xml and robots.txt
  if (!pathnameHasLocale && pathname !== '/sitemap.xml' && pathname !== '/robots.txt') {
    console.log('No locale in pathname, redirecting...')
    // Priority: 1. User metadata if logged in, 2. Cookie, 3. Browser preference
    const locale = user?.user_metadata?.preferred_language || getLocale(request)
    const url = new URL(`/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`, request.url)
    url.search = request.nextUrl.search

    const localeRedirectResponse = NextResponse.redirect(url)

    // Also set cookie if we're using a locale from user metadata
    if (user?.user_metadata?.preferred_language) {
      localeRedirectResponse.cookies.set('preferred-language', user.user_metadata.preferred_language, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // IMPORTANT: If we detected a country and there's no existing cookie, set it in the redirect response
    if (!preferredCountry) {
      const countrySlug = await getCountryFromIP(request, supabase)
      if (countrySlug) {
        console.log('Setting country cookie in locale redirect:', countrySlug)
        localeRedirectResponse.cookies.set('preferred-country', countrySlug, {
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
    }

    return localeRedirectResponse
  }

  // Step 4: Check auth and redirect for protected routes if needed
  // Get the path without the locale prefix for easier checks
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${currentLocale}`), '')

  // Check if logged-in user is trying to access login or signup pages
  if (user && (pathWithoutLocale === '/auth/login' || pathWithoutLocale === '/auth/signup')) {
    // Redirect to home page with the correct locale
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = `/${currentLocale}/`
    return NextResponse.redirect(homeUrl)
  }

  const publicPaths = ['', '/about-us', '/terms-of-service', '/privacy-policy']
  const pathStartsWithPublic = ['/help', '/auth', '/listings', '/contact', '/sell']

  const isPublicPath =
    publicPaths.includes(pathWithoutLocale) ||
    pathStartsWithPublic.some(p => pathWithoutLocale.startsWith(p))

  if (!user && !isPublicPath) {
    console.log('Redirecting to login for protected route')
    // No user and trying to access protected route
    // Redirect to login page with the correct locale
    const url = request.nextUrl.clone()
    url.pathname = `/${currentLocale}/auth/login`
    url.search = `?redirectTo=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  console.log('=== MIDDLEWARE END ===')
  console.log('Final response cookies:', Array.from(response.cookies.getAll()))
  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files, sitemap.xml, robots.txt, etc.)
    '/((?!_next|api|favicon.ico|images|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)',
  ],
  // Enable geolocation in Edge Runtime
  runtime: 'experimental-edge'
}