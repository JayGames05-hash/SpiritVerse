import { query } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req, res) {
  const { post_id } = req.query

  if (req.method === 'GET') {
    try {
      // Get total count of likes for this post
      const countResult = await query(
        'SELECT COUNT(*) as count FROM reactions WHERE post_id = $1 AND type = $2',
        [post_id, 'like']
      )
      const count = parseInt(countResult.rows[0].count) || 0

      // Check if current user liked it
      const user = await getUserFromRequest(req)
      let liked = false
      if (user) {
        const likeResult = await query(
          'SELECT id FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
          [post_id, user.id, 'like']
        )
        liked = likeResult.rows.length > 0
      }

      return res.status(200).json({ count, liked })
    } catch (err) {
      console.error('Failed to fetch reactions:', err)
      return res.status(500).json({ error: 'Failed to fetch reactions' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await getUserFromRequest(req)
      if (!user) {
        console.error('No user found in request')
        return res.status(401).json({ error: 'Unauthorized - please sign in' })
      }

      if (!post_id) {
        return res.status(400).json({ error: 'post_id is required' })
      }

      // Check if already liked
      const existing = await query(
        'SELECT id FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
        [post_id, user.id, 'like']
      )

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already liked' })
      }

      // Create reaction
      const result = await query(
        'INSERT INTO reactions (post_id, user_id, type) VALUES ($1, $2, $3) RETURNING *',
        [post_id, user.id, 'like']
      )

      console.log('Reaction created:', result.rows[0].id)
      return res.status(201).json({ reaction: result.rows[0] })
    } catch (err) {
      console.error('Failed to create reaction:', err.message || err)
      return res.status(500).json({ error: 'Failed to create reaction: ' + (err.message || 'Unknown error') })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const user = await getUserFromRequest(req)
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized - please sign in' })
      }

      if (!post_id) {
        return res.status(400).json({ error: 'post_id is required' })
      }

      // Delete reaction
      await query(
        'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
        [post_id, user.id, 'like']
      )

      console.log('Reaction deleted')
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Failed to delete reaction:', err.message || err)
      return res.status(500).json({ error: 'Failed to delete reaction' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
