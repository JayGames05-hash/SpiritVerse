import { getUserFromRequest, serializeUser } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userRow = await getUserFromRequest(req)
    return res.status(200).json({ user: serializeUser(userRow) })
  }

  if (req.method === 'PATCH') {
    const userRow = await getUserFromRequest(req)
    if (!userRow) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { verse_interval_hours } = req.body || {}
    const interval = Number(verse_interval_hours)
    if (![2, 4, 6, 12, 24].includes(interval)) {
      return res.status(400).json({ error: 'Invalid verse interval. Use 2, 4, 6, 12, or 24 hours.' })
    }

    try {
      const result = await query(
        'update accounts set verse_interval_hours = $1 where id = $2 returning id, email, saint_name, full_name, is_admin, verse_interval_hours, created_at',
        [interval, userRow.id],
      )

      return res.status(200).json({ user: serializeUser(result.rows[0]) })
    } catch (err) {
      console.error('Failed to update verse interval:', err)
      return res.status(500).json({ error: 'Failed to update verse interval', details: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
