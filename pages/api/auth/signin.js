import { verifyPassword, serializeUser, getUserFromRequest, createSession } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const result = await query(
    'select id, email, saint_name, full_name, password_hash, is_admin, created_at from accounts where email = $1',
    [normalizedEmail],
  )

  const account = result.rows[0]
  if (!account) {
    return res.status(400).json({ error: 'Invalid email or password.' })
  }

  const isValid = await verifyPassword(password, account.password_hash)
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid email or password.' })
  }

  await createSession(res, account.id)
  return res.status(200).json({ user: serializeUser(account) })
}
