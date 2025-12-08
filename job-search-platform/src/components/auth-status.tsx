'use client'

import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function AuthStatus() {
  const { data: session, status } = useSession()
  const [isDevLoading, setIsDevLoading] = useState(false)

  const handleDevLogin = async () => {
    setIsDevLoading(true)
    try {
      // Use NextAuth's signIn with test credentials
      await signIn('credentials', {
        email: 'dev@localhost',
        password: 'devpass123',
        redirect: false,
      })
      // Refresh to pick up the session
      window.location.reload()
    } catch (error) {
      console.error('Dev login failed:', error)
    } finally {
      setIsDevLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Sign in
      </Link>

      {/* Dev bypass button - only shown in development */}
      {process.env.NODE_ENV !== 'production' && (
        <button
          onClick={handleDevLogin}
          disabled={isDevLoading}
          className="text-sm px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-colors disabled:opacity-50"
        >
          {isDevLoading ? '...' : '🔧 Dev Login'}
        </button>
      )}
    </div>
  )
}