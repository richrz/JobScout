'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SingleUserMode from '@/components/single-user-mode'

const CosmicLoginScene = dynamic(
  () => import('@/components/auth/cosmic-login-scene'),
  { ssr: false },
)

const dashboardRoute = '/dashboard-v2'

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.65 6.65 0 0 1 0-4.18V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push(dashboardRoute)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password.')
      } else {
        router.push(dashboardRoute)
        router.refresh()
      }
    } catch {
      setError('Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      try {
        const result = await signIn('credentials', {
          email: 'dev@localhost',
          password: 'devpass123',
          redirect: false,
        })

        if (result?.error) {
          setError('Mock Google sign-in failed.')
        } else {
          router.push(dashboardRoute)
          router.refresh()
        }
      } catch {
        setError('Could not complete mock Google sign-in.')
      } finally {
        setLoading(false)
      }
      return
    }

    await signIn('google', { callbackUrl: dashboardRoute })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07110c] text-white">
      <div className="absolute inset-0">
        <CosmicLoginScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(53,227,117,0.2),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(53,227,117,0.14),transparent_42%),linear-gradient(135deg,rgba(7,17,12,0.62),rgba(7,17,12,0.9))]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col justify-center gap-10 px-6 py-12 lg:grid lg:grid-cols-[1.25fr_0.9fr] lg:items-center lg:px-10">
        <section className="max-w-2xl">
          <div className="mb-6 w-44">
            <div className="relative h-10 w-full">
              <Image
                src="/images/logo-full-dark.svg"
                alt="JobScout"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#35e375]/35 bg-[#35e375]/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#b5f5cc]">
            Job Intelligence Hub
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Find better roles faster and stay in control of every application.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            JobScout gives you one command center for discovery, triage, map insights, and
            pipeline follow-through. Sign in to keep momentum and stop losing good opportunities.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-100/90 sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
              Live job intake and alerts
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
              Swipe triage to inbox zero
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
              Pipeline stage tracking
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
              AI resume and fit support
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-[#0f1b14]/82 p-6 shadow-[0_20px_90px_rgba(53,227,117,0.24)] backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Sign In</h2>
            <p className="mt-1 text-sm text-slate-300/90">Use Google or your JobScout credentials.</p>
          </div>

          <SingleUserMode />

          {error ? (
            <p className="mb-4 rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-300/75">
            <span className="h-px flex-1 bg-white/20" />
            or
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-200">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-[#35e375]/80 focus:ring-2 focus:ring-[#35e375]/35"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-200">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-[#35e375]/80 focus:ring-2 focus:ring-[#35e375]/35"
                placeholder="Enter password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#35e375] px-4 py-3 text-sm font-semibold text-[#0b1a12] transition hover:bg-[#2dd36b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
