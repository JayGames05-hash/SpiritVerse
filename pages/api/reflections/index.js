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
      try {
        const result = await query(
          `select id, post_id, note, created_at, updated_at
           from reflections
           where user_id = $1 and post_id = $2`,
          [user.id, post_id],
        )

        return res.status(200).json({ reflection: result.rows[0] || null })
      } catch (err) {
        console.error('Failed to fetch reflection:', err)
        return res.status(500).json({ error: 'Failed to fetch reflection' })
      }
    }

    try {
      const result = await query(
        `select id, post_id, note, created_at, updated_at
         from reflections
         where user_id = $1
         order by updated_at desc, created_at desc`,
        [user.id],
      )

      return res.status(200).json({ reflections: result.rows })
    } catch (err) {
      console.error('Failed to fetch reflections:', err)
      return res.status(500).json({ error: 'Failed to fetch reflections' })
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { post_id, note } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' })
    }

    const text = typeof note === 'string' ? note.trim() : ''
    if (!text) {
      return res.status(400).json({ error: 'note is required' })
    }

    try {
      const result = await query(
        `insert into reflections (user_id, post_id, note)
         values ($1, $2, $3)
         on conflict (user_id, post_id)
         do update set note = excluded.note, updated_at = now()
         returning id, post_id, note, created_at, updated_at`,
        [user.id, post_id, text],
      )

      try {
        await query(
          'insert into feature_events (user_id, event_type, metadata) values ($1, $2, $3)',
          [user.id, 'reflection_saved', JSON.stringify({ post_id, note_length: text.length })],
        )
      } catch (e) {
        console.warn('Failed to log reflection feature event:', e)
      }

      return res.status(200).json({ reflection: result.rows[0] })
    } catch (err) {
      console.error('Failed to save reflection:', err)
      return res.status(500).json({ error: 'Failed to save reflection' })
    }
  }

  if (req.method === 'DELETE') {
    const { post_id } = req.body || {}
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' })
    }

    try {
      await query(
        'delete from reflections where user_id = $1 and post_id = $2',
        [user.id, post_id],
      )

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('Failed to delete reflection:', err)
      return res.status(500).json({ error: 'Failed to delete reflection' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
