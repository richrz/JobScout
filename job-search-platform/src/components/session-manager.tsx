'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SessionInfo {
  userId: string
  email: string
  name?: string | null
  isSingleUser: boolean
  sessionId?: string
  expires?: Date
}

export default function SessionManager() {
  const { data: session, status } = useSession()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [extending, setExtending] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessionInfo()
    } else {
      setLoading(false)
    }
  }, [status])

  const fetchSessionInfo = async () => {
    try {
      const response = await fetch('/api/session')
      if (response.ok) {
        const data = await response.json()
        setSessionInfo(data.session)
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtendSession = async () => {
    setExtending(true)
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: session?.user?.email || '' // Use email as identifier
        }),
      })

      if (response.ok) {
        alert('Session extended successfully!')
        fetchSessionInfo()
      } else {
        alert('Failed to extend session')
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
      alert('Failed to extend session')
    } finally {
      setExtending(false)
    }
  }

  const handleRevokeSessions = async () => {
    if (!confirm('Are you sure you want to revoke all sessions? This will log you out of all devices.')) {
      return
    }

    try {
      const response = await fetch('/api/session', {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Revoked ${data.count} sessions. You will be redirected to login.`)
        window.location.href = '/auth/signin'
      } else {
        alert('Failed to revoke sessions')
      }
    } catch (error) {
      console.error('Failed to revoke sessions:', error)
      alert('Failed to revoke sessions')
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading session info...</div>
  }

  if (!sessionInfo) {
    return <div className="text-sm text-gray-500">No active session</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Logged in as:</p>
          <p className="text-sm font-medium text-gray-900">{sessionInfo.email}</p>
          {sessionInfo.name && (
            <p className="text-sm text-gray-600">{sessionInfo.name}</p>
          )}
        </div>

        {sessionInfo.isSingleUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Single-user mode is active
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            disabled={extending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded text-sm"
          >
            {extending ? 'Extending...' : 'Extend Session'}
          </button>
          
          <button
            onClick={handleRevokeSessions}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Revoke All Sessions
          </button>
        </div>
      </div>
    </div>
  )
}