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
    <div>
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl mb-4">Moderation Dashboard</h2>
        {loading && <div>Loading...</div>}
        {!loading && comments.length===0 && <div>No comments found.</div>}
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="p-3 border rounded bg-white">
              <div className="flex justify-between">
                <div className="font-semibold">{c.author_name || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 whitespace-pre-wrap">{c.text}</div>
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 bg-green-100" onClick={()=>updateStatus(c.id,'visible')}>Visible</button>
                <button className="px-2 py-1 bg-yellow-100" onClick={()=>updateStatus(c.id,'flagged')}>Flagged</button>
                <button className="px-2 py-1 bg-red-100" onClick={()=>updateStatus(c.id,'hidden')}>Hide</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
