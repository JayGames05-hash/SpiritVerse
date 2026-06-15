import { query } from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'

const VALID_STATUSES = ['pending', 'approved', 'denied']

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Missing verse suggestion id' })
  }

  if (req.method === 'PUT') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { status } = req.body || {}
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    if (!user.is_admin) {
      return res.status(403).json({ error: 'Only admins can approve or deny suggestions.' })
    }

    try {
      const result = await query(
        'update verse_suggestions set status = $1, updated_at = now() where id = $2 returning id, scripture_ref, title, reading_text, reflection, author_name, status, created_at, updated_at',
        [status, id],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found.' })
      }

      return res.status(200).json({ suggestion: result.rows[0] })
    } catch (err) {
      console.error('Failed to update suggestion status:', err)
      return res.status(500).json({ error: 'Failed to update suggestion' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
