import React, {useEffect, useState} from 'react'
import Comments from './Comments'
import { auth, getReactions, addReaction, removeReaction } from '../lib/apiClient'

export default function ReadingCard({post}){
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const { data, error } = await getReactions(post.id)
        if(error) throw error
        if(mounted) {
          setLikes(data.count)
          setLiked(data.liked)
        }
      }catch(e){ console.error('load reactions', e) }
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
    <article className="border p-5 rounded bg-white">
      <div className="flex justify-between items-baseline">
        <div>
          <div className="text-sm text-gray-600">{post.date}</div>
          <h1 className="mt-1 mb-3 text-2xl">{post.title || post.scripture_ref}</h1>
        </div>
        <div>
          <button onClick={toggleLike} className={`px-3 py-2 rounded ${liked ? 'bg-amber-200' : 'bg-gray-100'}`}>
            ❤️ {likes}
          </button>
        </div>
      </div>

      <div className="whitespace-pre-wrap mb-3">{post.reading_text}</div>
      <div className="italic text-gray-800 mb-3">{post.reflection}</div>

      <div className="mt-3">
        <Comments postId={post.id} />
      </div>
    </article>
  )
}
