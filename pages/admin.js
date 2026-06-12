import React, {useEffect, useState} from 'react'
import { getAdminComments, updateCommentStatus } from '../lib/apiClient'
import Header from '../components/Header'

export default function AdminPage(){
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-white mb-8">Moderation Dashboard</h2>
        {loading && (
          <div className="text-center text-white text-lg">Loading...</div>
        )}
        {!loading && comments.length === 0 && (
          <div className="bg-purple-700 rounded-lg p-8 text-white text-center">
            No comments found.
          </div>
        )}
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between mb-4">
                <div className="font-semibold text-purple-900">{c.author_name || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-gray-800 mb-4">{c.text}</div>
              <div className="flex gap-3">
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
      </main>
    </div>
  )
}
