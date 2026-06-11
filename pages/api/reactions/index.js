import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { post_id } = req.query
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required.' })
    }

    const user = await getUserFromRequest(req)
    const result = await query('select id, user_id, type, created_at from reactions where post_id = $1', [post_id])
    const reactions = result.rows
    const count = reactions.length
    const liked = user ? reactions.some((reaction) => reaction.user_id === user.id) : false
    return res.status(200).json({ reactions, count, liked })
  }

  if (req.method === 'POST') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to like posts.' })
    }

    const { post_id, type } = req.body || {}
    if (!post_id || !type) {
      return res.status(400).json({ error: 'post_id and type are required.' })
    }

    const result = await query(
      'insert into reactions (post_id, user_id, type) values ($1, $2, $3) on conflict do nothing returning *',
      [post_id, user.id, type],
    )

    return res.status(200).json({ reaction: result.rows[0] || null })
  }

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to unlike posts.' })
    }

    const { post_id } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required.' })
    }

    await query('delete from reactions where post_id = $1 and user_id = $2', [post_id, user.id])
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
