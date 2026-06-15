import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import readings from '../data/readings'

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadData() {
      setLoading(true)
      try {
        const [favRes, suggestionRes] = await Promise.all([
          fetch('/api/favorites', { credentials: 'include' }),
          fetch('/api/verses/suggestions?status=approved'),
        ])
        const favData = await favRes.json()
        const suggestionData = await suggestionRes.json()

        if (favRes.status === 401) {
          router.push('/signin')
          return
        }

        if (mounted) {
          setFavorites(favData.favorites || [])
          setSuggestions(suggestionData.suggestions || [])
        }
      } catch (err) {
        console.error('Failed to load favorites:', err)
        if (mounted) setError('Unable to load favorites. Please try again later.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [router])

  const renderItem = (postId) => {
    const reading = readings.find((item) => item.id === postId)
    if (reading) {
      return (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-[#4b2d23]">{reading.title || reading.scripture_ref}</h2>
          <p className="text-sm text-gray-500">{reading.scripture_ref}</p>
          <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">{reading.reading_text}</p>
        </div>
      )
    }

    const suggestion = suggestions.find((item) => item.id === postId)
    if (suggestion) {
      return (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-[#4b2d23]">{suggestion.title || suggestion.scripture_ref}</h2>
          <p className="text-sm text-gray-500">{suggestion.scripture_ref}</p>
          <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">{suggestion.reading_text}</p>
          {suggestion.reflection && <p className="mt-4 text-gray-600 italic">{suggestion.reflection}</p>}
          <p className="mt-3 text-sm text-gray-500">Suggested by {suggestion.author_name || 'Anonymous'}</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <p className="text-gray-600">This favorite item is not available anymore.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-4">Your Favorites</h1>
          <p className="text-gray-600">A personal list of readings and approved verse suggestions you have saved.</p>
        </div>

        {loading ? (
          <div className="text-white">Loading your favorites…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="bg-[#5a211f] rounded-3xl p-6 text-white text-center">
            <p className="mb-4">You have no favorites yet.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
            >
              Browse Readings
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id}>
                {renderItem(favorite.post_id)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
