import React, {useEffect, useState} from 'react'
import Comments from './Comments'
import { auth, getReactions, addReaction, removeReaction, getFavorite, addFavorite, removeFavorite } from '../lib/apiClient'

export default function ReadingCard({post}){
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [favorite, setFavorite] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const [{ data: reactionData, error: reactionError }, { data: favoriteData, error: favoriteError }] = await Promise.all([
          getReactions(post.id),
          getFavorite(post.id),
        ])
        if(reactionError) throw reactionError
        if(favoriteError) throw favoriteError
        if(mounted) {
          setLikes(reactionData.count)
          setLiked(reactionData.liked)
          setFavorite(favoriteData)
        }
      }catch(e){ console.error('load reactions/favorite', e) }
    }
    load()
    return ()=> { mounted = false }
  },[post.id])

  async function toggleLike(){
    try{
        const { data: userRes } = await auth.getUser()
        const user = userRes.user
        if(!user){
          alert('Please sign in to like posts.')
          return
        }
        if(liked){
          const { error } = await removeReaction(post.id)
          if(error) throw error
          setLiked(false)
          setLikes(Math.max(0, likes-1))
        }else{
          const { error } = await addReaction(post.id)
          if(error) throw error
          setLiked(true)
          setLikes(likes+1)
        }
    }catch(e){
      console.error('toggleLike', e)
      alert('Could not update like — try again.')
    }
  }

  return (
    <article className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          {post.date && <p className="text-sm text-gray-500 font-semibold">{post.date}</p>}
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#4b2d23]">{post.title || post.scripture_ref}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={toggleLike} 
            className={`px-4 py-2 rounded-2xl font-semibold transition whitespace-nowrap ${liked ? 'bg-amber-200 text-amber-900' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            ♥ {likes}
          </button>
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

      <div className="border-t pt-8">
        <Comments postId={post.id} />
      </div>
    </article>
  )
}
