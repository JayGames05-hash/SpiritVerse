import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'
import { setupWebPush } from '../../../lib/push'
import webpush from 'web-push'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!user.is_admin) {
    return res.status(403).json({ error: 'Only admins may send announcements.' })
  }

  const { title, body, url } = req.body || {}
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' })
  }

  try {
    setupWebPush()

    const subs = await query('select endpoint, p256dh, auth from push_subscriptions')
    const rows = subs.rows || []

    const payload = JSON.stringify({ title, body, url: url || '/' })

    const sendPromises = rows.map((row) =>
      webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
      ).catch(async (err) => {
        // If subscription is gone or invalid, remove it from DB
        try {
          const status = err?.statusCode || (err && err.body && JSON.parse(err.body).status)
          if (status === 404 || status === 410) {
            await query('delete from push_subscriptions where endpoint = $1', [row.endpoint])
          }
        } catch (e) {
          // ignore cleanup errors
        }
      }),
    )

    await Promise.allSettled(sendPromises)

    return res.status(200).json({ success: true, sent: rows.length })
  } catch (err) {
    console.error('Failed to send announcement:', err)
    return res.status(500).json({ error: 'Failed to send announcement' })
  }
}
