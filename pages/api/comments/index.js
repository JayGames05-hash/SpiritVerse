import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { post_id } = req.query
    const sql = post_id
      ? 'select * from comments where post_id = $1 order by created_at desc'
      : 'select * from comments order by created_at desc limit 200'
    const values = post_id ? [post_id] : []
    const result = await query(sql, values)
    return res.status(200).json({ comments: result.rows })
  }

  if (req.method === 'POST') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to post a comment.' })
    }

    const { post_id, text, author_name } = req.body || {}
    if (!post_id || !text) {
      return res.status(400).json({ error: 'post_id and text are required.' })
    }

    const authorName = author_name || user.user_metadata?.saint_name || user.user_metadata?.full_name || user.email || 'Anonymous'
    const result = await query(
      'insert into comments (post_id, text, author_id, author_name) values ($1, $2, $3, $4) returning *',
      [post_id, text, user.id, authorName],
    )

    return res.status(200).json({ comment: result.rows[0] })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
