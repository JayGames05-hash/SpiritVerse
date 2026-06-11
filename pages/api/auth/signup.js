import { hashPassword } from '../../../lib/auth'
import { createSession, serializeUser } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, saint_name } = req.body || {}
  if (!email || !password || !saint_name) {
    return res.status(400).json({ error: 'Email, password, and saint_name are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await query('select id from accounts where email = $1', [normalizedEmail])
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email already registered.' })
  }

  const password_hash = await hashPassword(password)
  const fullName = String(saint_name).trim()
  const result = await query(
    'insert into accounts (email, saint_name, full_name, password_hash) values ($1, $2, $3, $4) returning id, email, saint_name, full_name',
    [normalizedEmail, fullName, fullName, password_hash],
  )

  const userRow = result.rows[0]
  await createSession(res, userRow.id)
  return res.status(200).json({ user: serializeUser(userRow) })
}
