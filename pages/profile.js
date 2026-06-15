import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import readings from '../data/readings'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [likedQuotes, setLikedQuotes] = useState([])
  const [myAnswers, setMyAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('questions')

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/signin')
          return
        }
        setUser(data.user)

        // Fetch user's questions
        fetch('/api/questions', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            const userQuestions = (data.questions || []).filter(q => q.author_id === data.user?.id)
            setMyQuestions(userQuestions)
          })
          .catch(err => console.error('Failed to fetch questions:', err))

        // Fetch user's liked quotes
        fetch('/api/reactions/user', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            const reactions = data.reactions || []
            // Map post_ids to actual readings
            const liked = reactions
              .map(r => readings.find(reading => reading.id === r.post_id))
              .filter(Boolean)
            setLikedQuotes(liked)
          })
          .catch(err => console.error('Failed to fetch liked quotes:', err))

        setLoading(false)
      })
      .catch(() => router.push('/signin'))
  }, [router])

  const handleViewQuestion = id => {
    router.push(`/question/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-2">{user.full_name || user.email}</h1>
            {user.is_admin && (
              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700"
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
          <p className="text-gray-600">
            <span className="font-semibold">Member since:</span>{' '}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-white text-purple-900'
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            My Questions ({myQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'liked'
                ? 'bg-white text-purple-900'
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            Liked Quotes ({likedQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'answers'
                ? 'bg-white text-purple-900'
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            My Answers ({myAnswers.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'questions' && (
          <div>
            {myQuestions.length === 0 ? (
              <div className="bg-purple-700 rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't asked any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-purple-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Ask a Question
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">
                    <h3 className="text-xl font-bold text-purple-900 mb-2">{q.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{q.content}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <span className="text-xs text-gray-500">
                        {new Date(q.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleViewQuestion(q.id)}
                        className="text-purple-600 font-semibold hover:text-purple-800"
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

        {activeTab === 'liked' && (
          <div>
            {likedQuotes.length === 0 ? (
              <div className="bg-purple-700 rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't liked any quotes yet.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-purple-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Browse Quotes
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {likedQuotes.map(quote => (
                  <div key={quote.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <p className="text-gray-600 text-sm mb-2">{quote.date}</p>
                    <h3 className="text-xl font-bold text-purple-900 mb-3">{quote.title || quote.scripture_ref}</h3>
                    <p className="text-gray-800 mb-4 italic">{quote.reading_text}</p>
                    {quote.reflection && (
                      <p className="text-gray-600 text-sm border-t pt-4">{quote.reflection}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div>
            {myAnswers.length === 0 ? (
              <div className="bg-purple-700 rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't answered any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-purple-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
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
