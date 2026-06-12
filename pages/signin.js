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
      <main className="flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">Saint Account Center</h1>
          <p className="text-sm text-gray-600 mb-6">
            Create a saint-based account or sign in with your existing email. Accounts are stored directly in Postgres.
          </p>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${mode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </label>
            <label className="block mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-2">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </label>
            {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
            {message && <div className="text-green-600 mb-4 font-semibold">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Working…' : mode === 'register' ? 'Create saint account' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
