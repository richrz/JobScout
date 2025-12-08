import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge-compatible CSRF token generation
function generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Edge-compatible rate limiting using in-memory store
const rateLimitStore = new Map<string, { count: number; expires: number }>()

function isRateLimited(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || entry.expires < now) {
        rateLimitStore.set(key, { count: 1, expires: now + windowMs })
        return false
    }

    entry.count++
    return entry.count > maxRequests
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    const pathname = request.nextUrl.pathname

    // Skip middleware for static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/favicon.ico' ||
        pathname.startsWith('/public')
    ) {
        return response
    }

    // CSRF token handling for GET requests
    if (request.method === 'GET') {
        const existingToken = request.cookies.get('csrf-token')?.value
        if (!existingToken) {
            const token = generateCSRFToken()
            response.cookies.set('csrf-token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24,
                path: '/',
            })
        }
    }

    // CSRF validation for state-changing requests
    // if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    //     const tokenFromHeader = request.headers.get('x-csrf-token')
    //     const tokenFromCookie = request.cookies.get('csrf-token')?.value
    //
    //     if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    //         return new NextResponse('CSRF token validation failed', { status: 403 })
    //     }
    // }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        if (isRateLimited(`api:${clientIp}`, 10000, 60 * 60 * 1000)) {
            return new NextResponse('Too many requests', { status: 429 })
        }
    }

    // Single-user mode check (using env var - Edge compatible)
    if (process.env.SINGLE_USER_MODE === 'true') {
        const singleUserAuth = request.cookies.get('single-user-auth')?.value

        if (singleUserAuth === 'true') {
            return response
        }

        if (pathname === '/api/auth/single-user') {
            return response
        }

        if (pathname !== '/auth/signin') {
            return NextResponse.redirect(new URL('/auth/signin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
}
