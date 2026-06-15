import { useState } from 'react'
import Header from '../components/Header'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Search failed', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-4">Search the Daily Readings</h1>
          <p className="text-gray-600 mb-6">Find readings, saints, and approved verse suggestions across the app.</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by scripture, saint, or topic"
              className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#8b1e1e] focus:ring-2 focus:ring-[#f2e3d3]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8b1e1e] text-white rounded-2xl px-6 py-3 font-semibold hover:bg-[#7a1c1c] disabled:bg-gray-400 transition"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>
          {error && <div className="text-red-600 mt-4">{error}</div>}
        </div>

        <div className="space-y-4">
          {results.length === 0 && !loading ? (
            <div className="bg-[#5a211f] rounded-3xl p-6 text-white text-center">
              <p>Search anytime to discover readings, saints, and community verse suggestions.</p>
            </div>
          ) : null}

          {results.map((result) => (
            <div key={`${result.type}-${result.id}`} className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex flex-wrap justify-between gap-3 items-start mb-4">
                <div>
                  <p className="text-sm text-[#8b1e1e] font-semibold uppercase tracking-wide">{result.type}</p>
                  <h2 className="text-2xl font-bold text-[#4b2d23] mt-2">{result.title}</h2>
                  {result.scripture_ref && <p className="text-sm text-gray-500">{result.scripture_ref}</p>}
                </div>
                {result.feast_date && (
                  <span className="rounded-full bg-[#f6e1d2] px-3 py-1 text-sm font-semibold text-[#7c2a1d]">
                    Feast: {result.feast_date}
                  </span>
                )}
              </div>
              {result.excerpt && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{result.excerpt}</p>
              )}
              {result.reflection && (
                <p className="text-gray-600 italic">{result.reflection}</p>
              )}
              {result.author_name && (
                <p className="text-sm text-gray-500 mt-3">Suggested by {result.author_name}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
