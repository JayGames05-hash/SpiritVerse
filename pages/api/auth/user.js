import { getUserFromRequest, serializeUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userRow = await getUserFromRequest(req)
  return res.status(200).json({ user: serializeUser(userRow) })
}
