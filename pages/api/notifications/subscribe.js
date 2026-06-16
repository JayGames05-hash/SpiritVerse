import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userRow = await getUserFromRequest(req)
  if (!userRow) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { subscription } = req.body || {}
  if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription payload' })
  }

  try {
    await query(
      `insert into push_subscriptions (user_id, endpoint, p256dh, auth)
       values ($1, $2, $3, $4)
       on conflict (endpoint) do update set user_id = $1, p256dh = $3, auth = $4`,
      [userRow.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
    )
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Failed to store push subscription:', err)
    return res.status(500).json({ error: 'Failed to store subscription' })
  }
}
