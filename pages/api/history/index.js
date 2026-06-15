import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const result = await query(
        'select post_id, created_at from user_history where user_id = $1 order by created_at desc limit 50',
        [user.id],
      )
      return res.status(200).json({ history: result.rows })
    } catch (err) {
      console.error('Failed to fetch history:', err)
      return res.status(500).json({ error: 'Failed to fetch history' })
    }
  }

  if (req.method === 'POST') {
    const { post_id } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' })
    }

    try {
      const result = await query(
        'insert into user_history (user_id, post_id) values ($1, $2) returning post_id, created_at',
        [user.id, post_id],
      )
      return res.status(200).json({ entry: result.rows[0] })
    } catch (err) {
      console.error('Failed to log history:', err)
      return res.status(500).json({ error: 'Failed to log history' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
