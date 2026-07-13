import fs from 'fs'
import path from 'path'
import { setupWebPush } from '../../../../lib/push'

const SUB_FILE = path.resolve(process.cwd(), 'data', 'subscriptions.json')

function readSubs() {
  try {
    const raw = fs.readFileSync(SUB_FILE, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

function writeSubs(list) {
  try {
    fs.mkdirSync(path.dirname(SUB_FILE), { recursive: true })
    fs.writeFileSync(SUB_FILE, JSON.stringify(list, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to write subscriptions', e)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  // Expects { title, body, url }
  const { title, body, url } = req.body || {}
  if (!title || !body) return res.status(400).json({ error: 'title and body required' })

  const webpush = setupWebPush()
  const subs = readSubs()
  const failures = []

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s, JSON.stringify({ title, body, url }))
    } catch (err) {
      console.warn('Push failed for', s.endpoint, err.statusCode || err)
      // remove if gone
      if (err.statusCode === 410 || err.statusCode === 404) {
        failures.push(s.endpoint)
      }
    }
  }))

  if (failures.length) {
    const kept = subs.filter(s => !failures.includes(s.endpoint))
    writeSubs(kept)
  }

  res.status(200).json({ sent: true, removed: failures.length })
}
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
