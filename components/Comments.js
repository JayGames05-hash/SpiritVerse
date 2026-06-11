import React, { useEffect, useState } from 'react'
import { getComments, createComment, updateComment, deleteComment, auth } from '../lib/apiClient'

const BANNED_WORDS = ['badword1', 'badword2', 'curse']

function containsBanned(text) {
  const normalized = text.toLowerCase()
  return BANNED_WORDS.some((word) => normalized.includes(word))
}

export default function Comments({ postId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data, error } = await getComments(postId)
        if (error) throw error
        if (mounted) setComments(data || [])
      } catch (e) {
        console.error('load comments', e.message || e)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [postId])

  useEffect(() => {
    auth.getUser().then((res) => setCurrentUser(res.data.user)).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!text.trim()) return
    if (containsBanned(text)) {
      setError('Your comment was blocked by the moderation filter.')
      return
    }

    try {
      const resp = await fetch('/api/moderate', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await resp.json()
      if (result.blocked) {
        setError('Your comment was blocked by the moderation filter.')
        return
      }
    } catch (e) {
      console.error('moderation check failed', e)
    }

    try {
      const { data: userData } = await auth.getUser()
      const user = userData.user
      if (!user) {
        setError('Please sign in before posting a comment.')
        return
      }

      const authorName =
        user.user_metadata?.saint_name ||
        user.user_metadata?.full_name ||
        user.email ||
        'Anonymous'

      const { data, error } = await createComment(postId, text.trim(), authorName)
      if (error) throw error
      setComments([data, ...comments].slice(0, 200))
      setText('')
    } catch (e) {
      console.error('submit comment', e.message || e)
      setError('Failed to post comment — try signing in.')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment"
          className="w-full min-h-[80px] p-2 border"
        />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="mt-2">
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">
            Post comment
          </button>
        </div>
      </form>

      <div>
        {comments.length === 0 && <div className="text-gray-600">No comments yet.</div>}
        {comments.map((c) => (
          <div key={c.id} className="border-t pt-2 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">
                  {c.author_name}{' '}
                  <span className="text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{c.text}</div>
              </div>
              <div className="ml-4 text-sm">
                {currentUser && currentUser.id === c.author_id && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={async () => {
                        const newText = window.prompt('Edit your comment', c.text)
                        if (!newText) return
                        const { error } = await updateComment(c.id, { text: newText })
                        if (error) return alert('Update failed')
                        setComments(comments.map((x) => (x.id === c.id ? { ...x, text: newText } : x)))
                      }}
                      className="px-2 py-1 bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this comment?')) return
                        const { error } = await deleteComment(c.id)
                        if (error) return alert('Delete failed')
                        setComments(comments.filter((x) => x.id !== c.id))
                      }}
                      className="px-2 py-1 bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
