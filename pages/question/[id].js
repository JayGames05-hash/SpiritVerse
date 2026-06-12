import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

export default function QuestionDetail() {
  const router = useRouter()
  const { id } = router.query
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!id) return

    // Check if logged in
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => setIsLoggedIn(!!data.user))
      .catch(() => setIsLoggedIn(false))

    // Fetch question
    fetch(`/api/questions/${id}`)
      .then(res => res.json())
      .then(data => {
        setQuestion(data.question)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch question:', err)
        setLoading(false)
      })

    // Fetch answers
    fetch(`/api/answers?questionId=${id}`)
      .then(res => res.json())
      .then(data => setAnswers(data.answers || []))
      .catch(err => console.error('Failed to fetch answers:', err))
  }, [id])

  const handleSubmitAnswer = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/answers?questionId=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: answerContent }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to post answer')
      }

      const data = await res.json()
      setAnswers([data.answer, ...answers])
      setAnswerContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-purple-700 rounded-lg p-8 text-white text-center">
            <p>Question not found.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">{question.title}</h1>
          <p className="text-gray-600 text-sm mb-4">
            Asked by <span className="font-semibold">{question.author_name}</span> on{' '}
            {new Date(question.created_at).toLocaleDateString()}
          </p>
          <p className="text-gray-800 whitespace-pre-wrap">{question.content}</p>
        </div>

        {/* Answer Form */}
        {isLoggedIn && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Your Answer</h2>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={answerContent}
                onChange={e => setAnswerContent(e.target.value)}
                placeholder="Share your answer..."
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
                required
              />
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
              >
                {submitting ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-purple-700 rounded-lg p-8 text-white text-center mb-8">
            <p className="mb-4">Sign in to post an answer.</p>
            <button
              onClick={() => router.push('/signin')}
              className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Answers */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
          {answers.length === 0 ? (
            <div className="bg-purple-700 rounded-lg p-8 text-white text-center">
              <p>No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {answers.map(answer => (
                <div key={answer.id} className="bg-white rounded-lg shadow-lg p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    Answered by <span className="font-semibold">{answer.author_name}</span> on{' '}
                    {new Date(answer.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">{answer.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
