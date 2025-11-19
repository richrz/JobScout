import { NextRequest, NextResponse } from 'next/server'

const CSRF_TOKEN_LENGTH = 32
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'

export function generateCSRFToken(): string {
  // Use Web Crypto API instead of Node.js crypto for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(request: NextRequest): boolean {
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME)
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!tokenFromHeader || !tokenFromCookie) {
    return false
  }

  return tokenFromHeader === tokenFromCookie
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF validation for GET, HEAD, and OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  // Skip CSRF validation for API auth routes (NextAuth handles its own CSRF)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return null
  }

  // Validate CSRF token
  if (!validateCSRFToken(request)) {
    return new NextResponse('CSRF token validation failed', { status: 403 })
  }

  return null
}

export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export function getCSRFCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}