import React, { useEffect, useState } from 'react'
import { getAdminComments, updateCommentStatus, getVerseSuggestions, updateVerseSuggestionStatus } from '../lib/apiClient'
import Header from '../components/Header'

export default function AdminPage() {
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [pendingSuggestions, setPendingSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [testQuote, setTestQuote] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadComments() {
      setLoadingComments(true)
      const { data, error } = await getAdminComments()
      if (error) console.error(error)
      if (mounted) setComments(data || [])
      setLoadingComments(false)
    }

    async function loadSuggestions() {
      setLoadingSuggestions(true)
      const { data, error } = await getVerseSuggestions('pending')
      if (error) console.error(error)
      if (mounted) setPendingSuggestions(data || [])
      setLoadingSuggestions(false)
    }

    loadComments()
    loadSuggestions()

    async function loadMetrics() {
      setLoadingMetrics(true)
      try {
        const res = await fetch('/api/admin/metrics', { credentials: 'include' })
        if (!res.ok) {
          throw new Error('Failed to load metrics')
        }
        const data = await res.json()
        if (mounted) setMetrics(data.metrics)
      } catch (err) {
        console.error('Failed to load admin metrics:', err)
      } finally {
        if (mounted) setLoadingMetrics(false)
      }
    }

    loadMetrics()

    return () => {
      mounted = false
    }
  }, [])

  async function updateStatus(id, status) {
    try {
      const { error } = await updateCommentStatus(id, status)
      if (error) throw error
      setComments(comments.map(c => (c.id === id ? { ...c, status } : c)))
    } catch (e) {
      console.error(e)
      alert('Update failed')
    }
  }

  async function updateSuggestionStatus(id, status) {
    try {
      const { error } = await updateVerseSuggestionStatus(id, status)
      if (error) throw error
      setPendingSuggestions(pendingSuggestions.filter(s => s.id !== id))
    } catch (err) {
      console.error(err)
      alert('Could not update suggestion status')
    }
  }

  async function handleRandomQuote() {
    setLoadingQuote(true)
    try {
      const res = await fetch('/api/admin/quote', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        alert('Error: ' + (data.error || 'Failed to fetch quote'))
        return
      }
      const data = await res.json()
      setTestQuote(data.quote)
    } catch (err) {
      console.error('Error:', err)
      alert('Failed to fetch quote')
    } finally {
      setLoadingQuote(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#4b2d23] mb-4">Quote Testing</h2>
          <p className="text-gray-600 mb-6">Click below to force a new random quote (for testing purposes)</p>
          <button
            onClick={handleRandomQuote}
            disabled={loadingQuote}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition mb-6"
          >
            {loadingQuote ? 'Loading...' : 'Get Random Quote'}
          </button>

          {testQuote && (
            <div className="bg-[#f5e5dc] rounded-lg p-6 border-l-4 border-[#c89f5d]">
              {testQuote.date && <p className="text-sm text-gray-500 font-semibold mb-2">{testQuote.date}</p>}
              <h3 className="text-xl font-bold text-[#4b2d23] mb-3">{testQuote.title || testQuote.scripture_ref}</h3>
              <p className="text-gray-800 mb-4 italic">{testQuote.reading_text}</p>
              {testQuote.reflection && (
                <p className="text-gray-600 text-sm border-t pt-4">{testQuote.reflection}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8">
          <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-[#4b2d23] mb-6">Pending Verse Suggestions</h2>
            {loadingSuggestions ? (
              <div className="text-gray-700">Loading suggestions...</div>
            ) : pendingSuggestions.length === 0 ? (
              <div className="rounded-3xl bg-[#f5e5dc] border border-[#d7b69a] p-6 text-gray-700">
                No pending verse suggestions at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="rounded-3xl border border-gray-200 p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">{suggestion.scripture_ref}</p>
                        <h3 className="text-xl font-semibold text-[#4b2d23]">{suggestion.title}</h3>
                        <p className="text-sm text-gray-500">Suggested by {suggestion.author_name || 'Anonymous'}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                        {suggestion.status}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap mb-4">{suggestion.reading_text}</p>
                    {suggestion.reflection && <p className="text-gray-600 mb-4">{suggestion.reflection}</p>}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'denied')}
                        className="px-4 py-2 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 transition"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-[#4b2d23] mb-4">Admin Metrics</h2>
            {loadingMetrics ? (
              <div className="text-gray-700">Loading metrics...</div>
            ) : metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-[#f8ebe1] p-5">
                  <p className="text-sm text-[#7a2b1e] uppercase font-semibold">Pending Suggestions</p>
                  <p className="text-3xl font-bold text-[#4b2d23]">{metrics.pendingSuggestions}</p>
                </div>
                <div className="rounded-3xl bg-[#eef4ea] p-5">
                  <p className="text-sm text-[#4b5c3c] uppercase font-semibold">Approved Suggestions</p>
                  <p className="text-3xl font-bold text-[#4b2d23]">{metrics.approvedSuggestions}</p>
                </div>
                <div className="rounded-3xl bg-[#f5e8dd] p-5">
                  <p className="text-sm text-[#7a2b1e] uppercase font-semibold">Total Comments</p>
                  <p className="text-3xl font-bold text-[#4b2d23]">{metrics.commentsTotal}</p>
                </div>
                <div className="rounded-3xl bg-[#eceaf2] p-5">
                  <p className="text-sm text-[#4b2d23] uppercase font-semibold">Registered Users</p>
                  <p className="text-3xl font-bold text-[#4b2d23]">{metrics.usersTotal}</p>
                </div>
                <div className="rounded-3xl bg-[#f8ebe1] p-5 sm:col-span-2">
                  <p className="text-sm text-[#7a2b1e] uppercase font-semibold">Favorites Saved</p>
                  <p className="text-3xl font-bold text-[#4b2d23]">{metrics.favoritesTotal}</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-700">Unable to display metrics.</div>
            )}
          </section>

          <section>
            <h2 className="text-4xl font-bold text-white">Moderation Dashboard</h2>
            {loadingComments ? (
              <div className="text-center text-white text-lg mt-6">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center mt-6">
                No comments found.
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {comments.map(c => (
                  <div key={c.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
                      <div className="font-semibold text-[#4b2d23]">{c.author_name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-gray-800 mb-4">{c.text}</div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                        onClick={() => updateStatus(c.id, 'visible')}
                      >
                        Visible
                      </button>
                      <button
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                        onClick={() => updateStatus(c.id, 'flagged')}
                      >
                        Flagged
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                        onClick={() => updateStatus(c.id, 'hidden')}
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
