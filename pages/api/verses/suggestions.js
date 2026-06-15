import { query } from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'

const VALID_STATUSES = ['pending', 'approved', 'denied']

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const statusParam = String(req.query.status || '').toLowerCase()

    if (statusParam === 'approved') {
      try {
        const result = await query(
          'select id, scripture_ref, title, reading_text, reflection, author_name, status, created_at, updated_at from verse_suggestions where status = $1 order by created_at desc',
          ['approved'],
        )
        return res.status(200).json({ suggestions: result.rows })
      } catch (err) {
        console.error('Failed to load approved verse suggestions:', err)
        return res.status(500).json({ error: 'Failed to load approved suggestions' })
      }
    }

    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const values = []
    let sql = 'select id, scripture_ref, title, reading_text, reflection, author_name, status, created_at, updated_at from verse_suggestions'

    if (user.is_admin) {
      if (statusParam && VALID_STATUSES.includes(statusParam)) {
        sql += ' where status = $1'
        values.push(statusParam)
      }
    } else {
      sql += ' where author_id = $1'
      values.push(user.id)
    }

    sql += ' order by created_at desc'

    try {
      const result = await query(sql, values)
      return res.status(200).json({ suggestions: result.rows })
    } catch (err) {
      console.error('Failed to load verse suggestions:', err)
      return res.status(500).json({ error: 'Failed to load suggestions' })
    }
  }

  if (req.method === 'POST') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'You must be signed in to suggest a verse.' })
    }

    const { scripture_ref, title, reading_text, reflection } = req.body || {}
    if (!scripture_ref || !reading_text) {
      return res.status(400).json({ error: 'Scripture reference and verse text are required.' })
    }

    const suggestionTitle = title?.trim() || scripture_ref.trim()
    const authorName = user.full_name || user.email || 'Anonymous'

    try {
      const result = await query(
        'insert into verse_suggestions (author_id, author_name, scripture_ref, title, reading_text, reflection) values ($1, $2, $3, $4, $5, $6) returning id, scripture_ref, title, reading_text, reflection, author_name, status, created_at, updated_at',
        [user.id, authorName, scripture_ref.trim(), suggestionTitle, reading_text.trim(), reflection?.trim() || null],
      )
      return res.status(201).json({ suggestion: result.rows[0] })
    } catch (err) {
      console.error('Failed to create verse suggestion:', err)
      return res.status(500).json({ error: 'Failed to create verse suggestion' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
