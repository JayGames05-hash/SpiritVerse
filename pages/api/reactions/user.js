import { query } from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get all reactions (likes) for this user
    const result = await query(
      'SELECT post_id, type, created_at FROM reactions WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    return res.status(200).json({ reactions: result.rows })
  } catch (err) {
    console.error('Failed to fetch user reactions:', err)
    return res.status(500).json({ error: 'Failed to fetch reactions' })
  }
}
