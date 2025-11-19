import { NextRequest, NextResponse } from 'next/server'
import { getSessionInfo, extendSession, cleanupExpiredSessions, getActiveSessions, revokeAllSessions } from '@/lib/session-manager'
import { getCurrentUser } from '@/lib/auth-utils'

// GET /api/session - Get current session info
export async function GET(request: NextRequest) {
  try {
    const sessionInfo = await getSessionInfo()
    
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      session: sessionInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting session info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/session/extend - Extend session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { sessionToken } = await request.json()
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      )
    }

    const success = await extendSession(sessionToken)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Session extended successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to extend session' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error extending session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/session - Revoke all sessions
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const count = await revokeAllSessions(user.id)
    
    return NextResponse.json({
      success: true,
      message: `Revoked ${count} sessions`,
      count
    })
  } catch (error) {
    console.error('Error revoking sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}