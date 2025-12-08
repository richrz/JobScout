import { NextResponse } from 'next/server'

// DEV-ONLY: Quick bypass endpoint for testing
export async function POST() {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const response = NextResponse.json({
        success: true,
        message: 'Dev login successful',
        user: {
            id: 'dev-user-001',
            email: 'dev@localhost',
            name: 'Dev User'
        }
    })

    // Set a cookie to mark as authenticated for dev purposes
    response.cookies.set('dev-auth', 'true', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    return response
}

export async function DELETE() {
    const response = NextResponse.json({ success: true, message: 'Dev logout successful' })
    response.cookies.delete('dev-auth')
    return response
}
