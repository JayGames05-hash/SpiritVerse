import fs from 'fs'
import path from 'path'

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
  try {
    const sub = req.body
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' })
    const list = readSubs()
    const exists = list.find(s => s.endpoint === sub.endpoint)
    if (!exists) {
      list.push(sub)
      writeSubs(list)
    }
    res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed' })
  }
}
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
