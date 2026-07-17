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

    const { verse_interval_minutes, notification_schedule } = req.body || {}
    const updates = []
    const values = []

    if (verse_interval_minutes !== undefined) {
      const interval = Number(verse_interval_minutes)
      if (!Number.isInteger(interval) || interval < 10 || interval > 1440 || interval % 10 !== 0) {
        return res.status(400).json({ error: 'Invalid verse interval. Provide minutes in 10-minute increments between 10 and 1440.' })
      }
      updates.push(`verse_interval_minutes = $${updates.length + 1}`)
      values.push(interval)
    }

    if (notification_schedule !== undefined) {
      const allowedSchedules = ['every_2_hours', 'morning_evening']
      if (!allowedSchedules.includes(notification_schedule)) {
        return res.status(400).json({ error: 'Invalid notification schedule.' })
      }
      updates.push(`notification_schedule = $${updates.length + 1}`)
      values.push(notification_schedule)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid settings to update.' })
    }

    values.push(userRow.id)
    try {
      const result = await query(
        `update accounts set ${updates.join(', ')} where id = $${values.length} returning id, email, saint_name, full_name, is_admin, verse_interval_minutes, notification_schedule, created_at`,
        values,
      )

      return res.status(200).json({ user: serializeUser(result.rows[0]) })
    } catch (err) {
      console.error('Failed to update user settings:', err)
      return res.status(500).json({ error: 'Failed to update settings', details: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
