import React, {useEffect, useState} from 'react'
import Comments from './Comments'
import { auth, getFavorite, addFavorite, removeFavorite, getReflection, saveReflection } from '../lib/apiClient'

export default function ReadingCard({post}){
  const [favorite, setFavorite] = useState(false)
  const [reflectionNote, setReflectionNote] = useState('')
  const [reflectionSaving, setReflectionSaving] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const { data: favoriteData, error: favoriteError } = await getFavorite(post.id)
        if(favoriteError) throw favoriteError
        if(mounted) setFavorite(favoriteData)

        const { data: reflectionData, error: reflectionError } = await getReflection(post.id)
        if(reflectionError) throw reflectionError
        if(mounted) setReflectionNote(reflectionData?.note || '')
      }catch(e){ console.error('load favorite', e) }
    }
    load()
    return ()=> { mounted = false }
  },[post.id])

  // Favorites are used instead of separate likes; users can save posts.

  return (
    <article className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          {post.date && <p className="text-sm text-gray-500 font-semibold">{post.date}</p>}
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#4b2d23]">{post.title || post.scripture_ref}</h1>
          {post.scripture_ref && (
            <p className="mt-2 text-sm text-[#8b1e1e] font-semibold">Scripture: {post.scripture_ref}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              try {
                const { data: userRes } = await auth.getUser()
                const user = userRes.user
                if (!user) {
                  alert('Please sign in to save favorites.')
                  return
                }
                if (favorite) {
                  const { error } = await removeFavorite(post.id)
                  if (error) throw error
                  setFavorite(false)
                } else {
                  const { error } = await addFavorite(post.id)
                  if (error) throw error
                  setFavorite(true)
                }
              } catch (e) {
                console.error('toggle favorite', e)
                alert('Could not update favorites — try again.')
              }
            }}
            className={`px-4 py-2 rounded-2xl font-semibold transition whitespace-nowrap ${favorite ? 'bg-red-100 text-[#7a1c1c]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {favorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="text-lg leading-relaxed text-gray-800 mb-6 whitespace-pre-wrap border-l-4 border-[#c89f5d] pl-6 py-4 bg-[#f5e5dc] rounded">
        {post.reading_text}
      </div>
      
      {post.reflection && (
        <div className="church-panel-strong rounded-3xl p-6 mb-8 border church-border">
          <h3 className="text-sm font-semibold text-[#5d2e58] mb-2">Reflection</h3>
          <p className="text-[#4b3648] italic">{post.reflection}</p>
        </div>
      )}

      <div className="rounded-3xl border border-[#e2cdb6] bg-[#fffaf5] p-5 mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-[#4b2d23]">Personal reflection journal</h3>
          <span className="text-xs text-gray-500">Private</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">Save a short reflection for this reading. It stays private to your account.</p>
        <textarea
          value={reflectionNote}
          onChange={(e) => setReflectionNote(e.target.value)}
          placeholder="Write a short note about what this reading means to you..."
          className="w-full rounded-2xl border border-[#d6c4b5] bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#8b1e1e] min-h-[100px]"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={async () => {
              try {
                const { data: userRes } = await auth.getUser()
                const user = userRes.user
                if (!user) {
                  alert('Please sign in to save your reflection.')
                  return
                }

                if (!reflectionNote.trim()) {
                  alert('Write a short note before saving.')
                  return
                }

                setReflectionSaving(true)
                const { error } = await saveReflection(post.id, reflectionNote)
                if (error) throw error
                alert('Reflection saved.')
              } catch (e) {
                console.error('save reflection', e)
                alert('Could not save your reflection — try again.')
              } finally {
                setReflectionSaving(false)
              }
            }}
            className="bg-[#8b1e1e] text-white px-4 py-2 rounded-2xl font-semibold disabled:opacity-60"
            disabled={reflectionSaving}
          >
            {reflectionSaving ? 'Saving...' : 'Save reflection'}
          </button>
        </div>
      </div>

      <div className="border-t pt-8">
        <Comments postId={post.id} />
      </div>
    </article>
  )
}
