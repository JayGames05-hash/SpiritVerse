import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import readings from '../data/readings'

export default function ReflectionsPage() {
  const router = useRouter()
  const [reflections, setReflections] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/reflections', { credentials: 'include' })
        const data = await res.json()

        if (res.status === 401) {
          router.push('/signin')
          return
        }

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load reflections.')
        }

        if (mounted) {
          setReflections(data.reflections || [])
        }
      } catch (err) {
        console.error('Failed to load reflections:', err)
        if (mounted) setError(err.message || 'Unable to load reflections. Please try again later.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [router])

  const handleDelete = async (postId) => {
    if (!confirm('Delete this reflection?')) return
    try {
      const res = await fetch('/api/reflections', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to delete reflection.')
      setReflections((current) => current.filter((entry) => entry.post_id !== postId))
      if (editingId === postId) {
        setEditingId(null)
        setDraftText('')
      }
    } catch (err) {
      console.error('Failed to delete reflection:', err)
      alert(err.message || 'Unable to delete reflection.')
    }
  }

  const handleEditStart = (entry) => {
    setEditingId(entry.post_id)
    setDraftText(entry.note)
  }

  const handleSaveEdit = async (postId) => {
    const text = draftText.trim()
    if (!text) {
      alert('Write a short note before saving.')
      return
    }

    try {
      const res = await fetch('/api/reflections', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, note: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to update reflection.')

      setReflections((current) => current.map((entry) => entry.post_id === postId ? { ...entry, note: text, updated_at: new Date().toISOString() } : entry))
      setEditingId(null)
      setDraftText('')
    } catch (err) {
      console.error('Failed to update reflection:', err)
      alert(err.message || 'Unable to update reflection.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-4">My Reflections</h1>
          <p className="text-gray-600">A private journal of the short notes you’ve saved for each reading.</p>
        </div>

        {loading ? (
          <div className="text-white">Loading your reflections…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : reflections.length === 0 ? (
          <div className="bg-[#5a211f] rounded-3xl p-6 text-white text-center">
            <p className="mb-4">You have not saved any reflections yet.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
            >
              Start a Reading
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reflections.map((reflection) => {
              const reading = readings.find((item) => item.id === reflection.post_id)
              const isEditing = editingId === reflection.post_id
              return (
                <div key={reflection.id} className="bg-white rounded-3xl shadow-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-[#4b2d23]">{reading?.title || reflection.post_id}</h2>
                      {reading?.scripture_ref && <p className="text-sm text-gray-500">{reading.scripture_ref}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditStart(reflection)}
                        className="text-sm font-semibold text-[#8b1e1e] hover:text-[#6d1b1b]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reflection.post_id)}
                        className="text-sm font-semibold text-[#8b1e1e] hover:text-[#6d1b1b]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full rounded-2xl border border-[#d6c4b5] bg-[#fffaf5] p-3 min-h-[140px]"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleSaveEdit(reflection.post_id)}
                          className="bg-[#8b1e1e] text-white px-4 py-2 rounded-2xl font-semibold"
                        >
                          Save changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setDraftText('')
                          }}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reflection.note}</p>
                  )}

                  <p className="mt-4 text-xs text-gray-500">
                    Saved {new Date(reflection.updated_at || reflection.created_at).toLocaleDateString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
