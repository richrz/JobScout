import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { isSingleUserMode } from './auth-utils'

export interface SessionInfo {
  userId: string
  email: string
  name?: string | null
  isSingleUser: boolean
  sessionId?: string
  expires?: Date
}

export async function getSessionInfo(): Promise<SessionInfo | null> {
  try {
    // Check single-user mode first
    if (isSingleUserMode()) {
      const singleUserAuth = await getSingleUserSession()
      if (singleUserAuth) {
        return singleUserAuth
      }
    }

    // Get NextAuth session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isSingleUser: false,
    }
  } catch (error) {
    console.error('Error getting session info:', error)
    return null
  }
}

export async function getSingleUserSession(): Promise<SessionInfo | null> {
  if (!isSingleUserMode()) {
    return null
  }

  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isSingleUser: true,
    }
  } catch (error) {
    console.error('Error getting single user session:', error)
    return null
  }
}

export async function extendSession(sessionToken: string): Promise<boolean> {
  // For now, we'll just return true since NextAuth handles session extension automatically
  // In a real implementation, you might want to integrate with NextAuth's session management
  try {
    // This is a placeholder - NextAuth automatically extends sessions on activity
    console.log('Session extension requested for token:', sessionToken)
    return true
  } catch (error) {
    console.error('Error extending session:', error)
    return false
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  // NextAuth automatically handles expired session cleanup
  // This is a placeholder for custom cleanup logic if needed
  try {
    console.log('Session cleanup requested')
    return 0
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}

export async function getActiveSessions(userId: string): Promise<number> {
  // This would require integration with NextAuth's session management
  // For now, return a placeholder value
  try {
    console.log('Active sessions requested for user:', userId)
    return 1 // Placeholder - assume 1 active session
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return 0
  }
}

export async function revokeAllSessions(userId: string): Promise<number> {
  // This would require integration with NextAuth's session management
  // For now, this is a placeholder
  try {
    console.log('Revoke all sessions requested for user:', userId)
    return 1 // Placeholder - assume 1 session revoked
  } catch (error) {
    console.error('Error revoking sessions:', error)
    return 0
  }
}