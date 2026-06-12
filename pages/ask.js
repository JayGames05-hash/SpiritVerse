import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'

export default function Ask() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setIsLoggedIn(true)
        }
      })
      .catch(() => setIsLoggedIn(false))

    // Fetch all questions
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || [])
        setFetchLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch questions:', err)
        setFetchLoading(false)
      })
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create question')
      }

      // Refresh questions list
      const refreshRes = await fetch('/api/questions')
      const refreshData = await refreshRes.json()
      setQuestions(refreshData.questions || [])

      // Clear form
      setTitle('')
      setContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewQuestion = id => {
    router.push(`/question/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Ask a Question</h1>

        {!isLoggedIn ? (
          <div className="bg-purple-700 rounded-lg p-8 text-white text-center mb-8">
            <p className="mb-4">You must be logged in to ask questions.</p>
            <button
              onClick={() => router.push('/signin')}
              className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Question Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Details</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Provide more details about your question..."
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </form>
        )}

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Questions</h2>
          {fetchLoading ? (
            <div className="text-center text-white">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="bg-purple-700 rounded-lg p-8 text-white text-center">
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questions.map(q => (
                <div key={q.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">{q.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Asked by <span className="font-semibold">{q.author_name}</span>
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{q.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleViewQuestion(q.id)}
                      className="text-purple-600 font-semibold hover:text-purple-800"
                    >
                      View & Answer →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
