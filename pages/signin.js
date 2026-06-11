import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { auth } from '../lib/apiClient'

export default function SignInPage() {
  const [mode, setMode] = useState('register')
  const [saintName, setSaintName] = useState('')
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

    if (!saintName.trim() || !email.trim() || !password) {
      setError('Saint name, email, and password are required.')
      return
    }

    setLoading(true)
    const { error } = await auth.signUp(
      { email: email.trim(), password },
      { options: { data: { saint_name: saintName.trim() } } },
    )
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
    <div>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white rounded shadow p-6">
          <h1 className="text-2xl font-semibold mb-4">Saint Account Center</h1>
          <p className="text-sm text-gray-600 mb-4">
            Create a saint-based account or sign in with your existing email. Accounts are stored directly in Postgres via the app API.
          </p>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 px-3 py-2 rounded ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign in
            </button>
          </div>

          <form onSubmit={mode === 'register' ? handleRegister : handleLogin}>
            {mode === 'register' && (
              <label className="block mb-4">
                <div className="text-sm font-medium mb-1">Saint username</div>
                <input
                  value={saintName}
                  onChange={(e) => setSaintName(e.target.value)}
                  placeholder="Saint Antony, Saint Mary, etc."
                  className="w-full border p-2 rounded"
                />
              </label>
            )}
            <label className="block mb-4">
              <div className="text-sm font-medium mb-1">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-4">
              <div className="text-sm font-medium mb-1">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full border p-2 rounded"
              />
            </label>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {message && <div className="text-green-600 mb-4">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? 'Working…' : mode === 'register' ? 'Create saint account' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
