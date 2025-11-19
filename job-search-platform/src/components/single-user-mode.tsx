'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function SingleUserMode() {
  const { data: session, status } = useSession()
  const [singleUserInfo, setSingleUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSingleUserMode() {
      try {
        const response = await fetch('/api/auth/single-user')
        if (response.ok) {
          const data = await response.json()
          setSingleUserInfo(data)
        }
      } catch (error) {
        console.error('Failed to check single-user mode:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSingleUserMode()
  }, [])

  const handleAutoLogin = async () => {
    try {
      const response = await fetch('/api/auth/single-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Reload the page to refresh the session
        window.location.reload()
      } else {
        console.error('Auto-login failed')
      }
    } catch (error) {
      console.error('Auto-login error:', error)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Checking single-user mode...</div>
  }

  if (!singleUserInfo?.singleUserMode) {
    return null // Don't show anything if single-user mode is not enabled
  }

  if (status === 'authenticated') {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
        <p className="text-sm">
          Single-user mode is active. You are logged in as {session?.user?.email}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
      <p className="text-sm mb-2">
        Single-user mode is enabled. Click below to automatically log in.
      </p>
      <button
        onClick={handleAutoLogin}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
      >
        Auto Login
      </button>
    </div>
  )
}