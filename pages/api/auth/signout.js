import { clearSession } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  await clearSession(req, res)
  return res.status(200).json({ ok: true })
}
