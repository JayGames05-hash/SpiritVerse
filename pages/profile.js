import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import readings from '../data/readings'

const verseIntervals = [2, 4, 6, 12, 24]

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [verseInterval, setVerseInterval] = useState(2)
  const [isSavingInterval, setIsSavingInterval] = useState(false)
  const [myQuestions, setMyQuestions] = useState([])
  const [myAnswers, setMyAnswers] = useState([])
  const [historyEntries, setHistoryEntries] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('questions')

  useEffect(() => {
    async function loadProfileData() {
      try {
        const userRes = await fetch('/api/auth/user', { credentials: 'include' })
        const userData = await userRes.json()
        if (!userData.user) {
          router.push('/signin')
          return
        }
        setUser(userData.user)
        setVerseInterval(userData.user.verse_interval_hours || 2)

        const [questionsRes, answersRes, historyRes, favoritesRes] = await Promise.all([
          fetch('/api/questions', { credentials: 'include' }),
          fetch('/api/answers/user', { credentials: 'include' }),
          fetch('/api/history', { credentials: 'include' }),
          fetch('/api/favorites', { credentials: 'include' }),
        ])

        const questionsData = await questionsRes.json()
        const answersData = await answersRes.json()
        const historyData = await historyRes.json()
        const favoritesData = await favoritesRes.json()

        setMyQuestions((questionsData.questions || []).filter(q => q.author_id === userData.user?.id))
        setMyAnswers(answersData.answers || [])

        const favoriteIds = (favoritesData.favorites || []).map(f => f.post_id)
        const favoritePosts = favoriteIds
          .map(id => readings.find(reading => reading.id === id))
          .filter(Boolean)
        setFavoriteItems(favoritePosts)

        setHistoryEntries(historyData.history || [])
      } catch (err) {
        console.error('Failed to load profile data:', err)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [router])

  const handleViewQuestion = id => {
    router.push(`/question/${id}`)
  }

  const handleIntervalChange = async (interval) => {
    if (interval === verseInterval) return
    setIsSavingInterval(true)
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verse_interval_hours: interval }),
      })
      if (!res.ok) {
        throw new Error('Failed to save verse interval')
      }
      const data = await res.json()
      setUser(data.user)
      setVerseInterval(data.user.verse_interval_hours || 2)
    } catch (err) {
      console.error('Interval save failed:', err)
      const message = err?.message || 'Unable to update verse frequency. Please try again.'
      alert(message)
    } finally {
      setIsSavingInterval(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
        <Header />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-2">{user.full_name || user.email}</h1>
            {user.is_admin && (
              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-[#8b1e1e] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#7a1c1c]"
                >
                  Admin Dashboard
                </button>
              </div>
            )}
          </div>
          {user.saint_name && (
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Saint Name:</span> {user.saint_name}
            </p>
          )}
          <p className="text-gray-600">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-gray-600 mb-6">
            <span className="font-semibold">Member since:</span>{' '}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <div className="bg-[#f8fafc] rounded-3xl p-5 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#4b2d23] mb-3">Verse refresh frequency</h2>
            <p className="text-gray-600 mb-4">Choose how often you want a new verse to appear. Default is 2 hours.</p>
            <div className="flex flex-wrap gap-3">
              {verseIntervals.map((interval) => (
                <button
                  key={interval}
                  onClick={() => handleIntervalChange(interval)}
                  disabled={isSavingInterval}
                  className={`px-4 py-2 rounded-2xl font-semibold transition border ${
                    verseInterval === interval
                      ? 'bg-[#4b2d23] text-white border-transparent'
                      : 'bg-white text-[#4b2d23] border-[#d1d5db] hover:border-[#9ca3af]'
                  }`}
                >
                  Every {interval}h
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">Your preference is saved immediately.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            My Questions ({myQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'answers'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            My Answers ({myAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'history'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            History ({historyEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'favorites'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            Favorites ({favoriteItems.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'questions' && (
          <div>
            {myQuestions.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't asked any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Ask a Question
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">
                    <h3 className="text-xl font-bold text-[#4b2d23] mb-2">{q.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{q.content}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <span className="text-xs text-gray-500">
                        {new Date(q.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleViewQuestion(q.id)}
                        className="text-[#8b1e1e] font-semibold hover:text-[#6d1b1b]"
                      >
                        View & Manage →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'history' && (
          <div>
            {historyEntries.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">Your reading history is empty.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  View Today’s Reading
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {historyEntries.map((entry) => {
                  const reading = readings.find((item) => item.id === entry.post_id)
                  return (
                    <div key={`${entry.post_id}-${entry.created_at}`} className="bg-white rounded-3xl shadow-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#4b2d23]">{reading?.title || entry.post_id}</h3>
                          {reading?.scripture_ref && <p className="text-sm text-gray-500">{reading.scripture_ref}</p>}
                        </div>
                        <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                      {reading && <p className="text-gray-700 mt-4 whitespace-pre-wrap">{reading.reading_text}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteItems.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You don't have any saved favorites yet.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Discover Readings
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {favoriteItems.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-[#4b2d23] mb-2">{quote.title || quote.scripture_ref}</h3>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{quote.reading_text}</p>
                    {quote.reflection && <p className="text-gray-600 italic">{quote.reflection}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div>
            {myAnswers.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't answered any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Browse Questions
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myAnswers.map(a => (
                  <div key={a.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <p className="text-gray-600 text-sm mb-2">Answer to question ID: {a.question_id}</p>
                    <p className="text-gray-800 mb-4 line-clamp-3">{a.content}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
