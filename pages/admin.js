import React, {useEffect, useState} from 'react'
import { getAdminComments, updateCommentStatus } from '../lib/apiClient'
import Header from '../components/Header'

export default function AdminPage(){
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [testQuote, setTestQuote] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      const { data, error } = await getAdminComments()
      if(error) console.error(error)
      if(mounted) setComments(data || [])
      setLoading(false)
    }
    load()
    return ()=> mounted = false
  },[])

  async function updateStatus(id, status){
    try{
      const { error } = await updateCommentStatus(id, status)
      if(error) throw error
      setComments(comments.map(c => c.id===id ? { ...c, status } : c))
    }catch(e){ console.error(e); alert('Update failed') }
  }

  async function handleRandomQuote(){
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Quote Testing Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">Quote Testing</h2>
          <p className="text-gray-600 mb-6">Click below to force a new random quote (for testing purposes)</p>
          <button
            onClick={handleRandomQuote}
            disabled={loadingQuote}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition mb-6"
          >
            {loadingQuote ? 'Loading...' : 'Get Random Quote'}
          </button>

          {testQuote && (
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
              <p className="text-sm text-gray-500 font-semibold mb-2">{testQuote.date}</p>
              <h3 className="text-xl font-bold text-purple-900 mb-3">{testQuote.title || testQuote.scripture_ref}</h3>
              <p className="text-gray-800 mb-4 italic">{testQuote.reading_text}</p>
              {testQuote.reflection && (
                <p className="text-gray-600 text-sm border-t pt-4">{testQuote.reflection}</p>
              )}
            </div>
          )}
        </div>

        {/* Moderation Dashboard */}
        <div>
          <h2 className="text-4xl font-bold text-white mb-8">Moderation Dashboard</h2>
          {loading && (
            <div className="text-center text-white text-lg">Loading...</div>
          )}
          {!loading && comments.length === 0 && (
            <div className="bg-purple-700 rounded-3xl p-6 sm:p-8 text-white text-center">
              No comments found.
            </div>
          )}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
                  <div className="font-semibold text-purple-900">{c.author_name || 'Anonymous'}</div>
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
        </div>
      </main>
    </div>
  )
}
