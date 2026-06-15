import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { auth } from '../lib/apiClient'

export default function SignInPage() {
  const [mode, setMode] = useState('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    auth.getUser().then((res) => {
      if (res.data.user) {
        router.replace('/')
      }
    })
  }, [router])

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    const { error } = await auth.signUp({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Account created. Redirecting...')
    setTimeout(() => router.push('/'), 600)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    const { error } = await auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Signed in successfully. Redirecting...')
    setTimeout(() => router.push('/'), 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-6 sm:p-8 mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-3 text-center sm:text-left">Saint Account Center</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 text-center sm:text-left">
            Create a saint-based account or sign in with your existing email. Accounts are stored directly in Postgres.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              className={`w-full sm:flex-1 px-4 py-3 rounded-2xl font-semibold transition ${mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
            <button
              className={`w-full sm:flex-1 px-4 py-3 rounded-2xl font-semibold transition ${mode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign in
            </button>
          </div>

          <form onSubmit={mode === 'register' ? handleRegister : handleLogin}>
            {/* saint is auto-assigned on account creation */}
            <label className="block mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Email</div>
              <input
                name="email"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>
            <label className="block mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-2">Password</div>
              <input
                name="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full border border-gray-300 p-3 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>
            {error && <div className="text-sm text-red-600 mb-4 font-semibold">{error}</div>}
            {message && <div className="text-sm text-green-600 mb-4 font-semibold">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Working…' : mode === 'register' ? 'Create saint account' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
