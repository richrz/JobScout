import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSingleUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if single-user mode is enabled
    if (process.env.SINGLE_USER_MODE !== 'true') {
      return NextResponse.json(
        { error: 'Single-user mode is not enabled' },
        { status: 403 }
      )
    }

    // Get or create the single user
    const user = await getOrCreateSingleUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create single user' },
        { status: 500 }
      )
    }

    // For single-user mode, we'll use a simple cookie-based approach
    // instead of creating NextAuth sessions manually
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })

    // Set a simple auth cookie for single-user mode
    response.cookies.set('single-user-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
    
  } catch (error) {
    console.error('Single-user mode error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Check if single-user mode is enabled
  if (process.env.SINGLE_USER_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Single-user mode is not enabled' },
      { status: 403 }
    )
  }

  // Return the current single user info
  const user = await getOrCreateSingleUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'No single user found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    singleUserMode: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  })
}