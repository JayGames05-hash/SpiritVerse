import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { post_id } = req.query
    if (post_id) {
      const result = await query(
        'select id, post_id, created_at from favorites where user_id = $1 and post_id = $2',
        [user.id, post_id],
      )
      return res.status(200).json({ favorite: result.rows.length > 0 })
    }

    const result = await query(
      'select id, post_id, created_at from favorites where user_id = $1 order by created_at desc',
      [user.id],
    )
    return res.status(200).json({ favorites: result.rows })
  }

  if (req.method === 'POST') {
    const { post_id } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' })
    }

    try {
      const result = await query(
        'insert into favorites (user_id, post_id) values ($1, $2) on conflict do nothing returning id, post_id, created_at',
        [user.id, post_id],
      )
      return res.status(200).json({ favorite: result.rows[0] || null })
    } catch (err) {
      console.error('Failed to add favorite:', err)
      return res.status(500).json({ error: 'Failed to add favorite' })
    }
  }

  if (req.method === 'DELETE') {
    const { post_id } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' })
    }

    try {
      await query('delete from favorites where user_id = $1 and post_id = $2', [user.id, post_id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('Failed to remove favorite:', err)
      return res.status(500).json({ error: 'Failed to remove favorite' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
