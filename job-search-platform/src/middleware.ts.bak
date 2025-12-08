import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isSingleUserMode } from '@/lib/auth-utils'
import { csrfMiddleware, generateCSRFToken, setCSRFCookie, getCSRFCookie } from '@/lib/csrf'
import { apiRateLimiter } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Apply CSRF protection
  const csrfError = csrfMiddleware(request)
  if (csrfError) {
    return csrfError
  }

  // Generate and set CSRF token for GET requests
  if (request.method === 'GET') {
    let csrfToken = getCSRFCookie(request)
    if (!csrfToken) {
      csrfToken = generateCSRFToken()
      setCSRFCookie(response, csrfToken)
    }
  }

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/')) {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const isRateLimited = await apiRateLimiter.isRateLimited(clientIp)
    
    if (isRateLimited) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  // Check if single-user mode is enabled
  if (isSingleUserMode()) {
    // Check if single-user auth cookie exists
    const singleUserAuth = request.cookies.get('single-user-auth')?.value
    
    if (singleUserAuth === 'true') {
      // Single-user is authenticated, allow the request
      return response
    }

    // If trying to access the single-user auth endpoint, allow it
    if (request.nextUrl.pathname === '/api/auth/single-user') {
      return response
    }

    // For other routes in single-user mode, we might want to auto-redirect
    // to the single-user auth endpoint or show a special login page
    if (request.nextUrl.pathname !== '/auth/signin') {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // For multi-user mode, NextAuth will handle authentication
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth handles these)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}