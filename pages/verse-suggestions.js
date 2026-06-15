import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'

export default function VerseSuggestionsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scriptureRef, setScriptureRef] = useState('')
  const [title, setTitle] = useState('')
  const [readingText, setReadingText] = useState('')
  const [reflection, setReflection] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data.user)
      })
      .catch(() => setIsLoggedIn(false))

    fetch('/api/verses/suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.suggestions || [])
        setFetchLoading(false)
      })
      .catch(() => setFetchLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!scriptureRef.trim() || !readingText.trim()) {
      setError('Scripture reference and verse text are required.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/verses/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ scripture_ref: scriptureRef, title, reading_text: readingText, reflection }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to submit suggestion.')
      return
    }

    setMessage('Verse suggestion submitted and awaiting approval.')
    setScriptureRef('')
    setTitle('')
    setReadingText('')
    setReflection('')
    setSuggestions([data.suggestion, ...suggestions])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-4">Suggest a Verse</h1>
          <p className="text-gray-600 mb-6">
            Share a Bible verse suggestion for the daily rotation. Admins will review and approve or deny it before it can appear in the randomizer.
          </p>

          {!isLoggedIn ? (
            <div className="bg-purple-700 rounded-3xl p-6 text-white text-center">
              <p className="mb-4">You must be signed in to suggest a verse.</p>
              <button
                onClick={() => router.push('/signin')}
                className="bg-white text-purple-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
              >
                Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Scripture Reference</label>
                <input
                  value={scriptureRef}
                  onChange={e => setScriptureRef(e.target.value)}
                  placeholder="John 3:16"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Verse Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="God’s Love for the World"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Verse Text</label>
                <textarea
                  value={readingText}
                  onChange={e => setReadingText(e.target.value)}
                  rows="4"
                  placeholder="For God so loved the world..."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Reflection / Notes</label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  rows="3"
                  placeholder="Why this verse matters..."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              {error && <div className="text-red-600 font-semibold">{error}</div>}
              {message && <div className="text-green-600 font-semibold">{message}</div>}
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white w-full py-3 rounded-2xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">Your Suggestions</h2>
          {fetchLoading ? (
            <div className="text-center text-gray-700">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-gray-600">No suggestions yet.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="rounded-3xl border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{suggestion.scripture_ref}</p>
                      <h3 className="text-lg font-semibold text-purple-900">{suggestion.title}</h3>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-900">
                      {suggestion.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">{suggestion.reading_text}</p>
                  {suggestion.reflection && <p className="text-gray-600 mt-2">{suggestion.reflection}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
