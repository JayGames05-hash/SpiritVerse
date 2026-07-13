import fs from 'fs'
import path from 'path'
import webpush from 'web-push'
import { setupWebPush } from '../../../lib/push'

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

  // configure web-push with VAPID keys
  setupWebPush()
  const subs = readSubs()
  const failures = []

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s, JSON.stringify({ title, body, url }))
    } catch (err) {
      console.warn('Push failed for', s.endpoint, err.statusCode || err)
      if (err && (err.statusCode === 410 || err.statusCode === 404)) {
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
