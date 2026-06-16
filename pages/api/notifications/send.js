import webpush from 'web-push'
import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'
import { setupWebPush } from '../../../lib/push'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userRow = await getUserFromRequest(req)
  if (!userRow) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { title, body, url } = req.body || {}
  if (!title || !body) {
    return res.status(400).json({ error: 'Missing title or body' })
  }

  setupWebPush()

  try {
    const result = await query(
      'select endpoint, p256dh, auth from push_subscriptions where user_id = $1',
      [userRow.id],
    )

    const sendPromises = result.rows.map((row) =>
      webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        JSON.stringify({ title, body, url }),
      ),
    )

    await Promise.allSettled(sendPromises)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Failed to send push notifications:', err)
    return res.status(500).json({ error: 'Failed to send notifications' })
  }
}
