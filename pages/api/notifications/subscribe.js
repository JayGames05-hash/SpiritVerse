import fs from 'fs'
import path from 'path'
import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

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

  const { subscription } = req.body || {}
  if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' })
  }

  if (process.env.DATABASE_URL) {
    const user = await getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'Please sign in to subscribe' })
    try {
      await query(
        `insert into push_subscriptions (user_id, endpoint, p256dh, auth)
         values ($1, $2, $3, $4)
         on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
        [user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
      )
      return res.status(201).json({ success: true })
    } catch (err) {
      console.error('Failed to save push subscription:', err)
      return res.status(500).json({ error: 'Failed to save subscription' })
    }
  }

  try {
    const list = readSubs()
    const exists = list.find(s => s.endpoint === subscription.endpoint)
    if (!exists) {
      list.push(subscription)
      writeSubs(list)
    }
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'failed' })
  }
}
