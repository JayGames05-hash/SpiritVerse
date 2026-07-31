import { useEffect, useState } from 'react'
import Header from '../components/Header'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadAnnouncements() {
      setLoading(true)
      try {
        const res = await fetch('/api/announcements', { credentials: 'include' })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load announcements.')
        }

        if (mounted) setAnnouncements(data.announcements || [])
      } catch (err) {
        console.error('Failed to load announcements:', err)
        if (mounted) setError(err.message || 'Unable to load announcements.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAnnouncements()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-3">Announcements</h1>
          <p className="text-gray-600">Community updates, reminders, and important notices from the app team.</p>
        </div>

        {loading ? (
          <div className="text-white">Loading announcements…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : announcements.length === 0 ? (
          <div className="bg-[#5a211f] rounded-3xl p-6 text-white text-center">
            <p>No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((item) => (
              <article key={item.id} className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <p className="text-sm text-gray-500 mb-2">{new Date(item.created_at).toLocaleString()}</p>
                <h2 className="text-2xl font-bold text-[#4b2d23] mb-3">{item.title}</h2>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{item.body}</p>
                {item.url && item.url !== '/' && (
                  <div className="mt-4">
                    <a href={item.url} className="text-[#8b1e1e] font-semibold hover:text-[#6d1b1b]">Open link →</a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
