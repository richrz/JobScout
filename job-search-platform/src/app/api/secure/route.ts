import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { loginRateLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit for login attempts
    const isRateLimited = await loginRateLimiter.isRateLimited(clientIp)
    
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Get current user (this will be null if not authenticated)
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Your secure API logic here
    const data = await request.json()
    
    // Example: Log the secure action
    console.log(`User ${user.email} performed secure action:`, data)
    
    return NextResponse.json({
      success: true,
      message: 'Secure action completed',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
    
  } catch (error) {
    console.error('Secure API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // This is just a test endpoint to check if the API is working
  return NextResponse.json({
    message: 'Secure API endpoint is working',
    timestamp: new Date().toISOString()
  })
}