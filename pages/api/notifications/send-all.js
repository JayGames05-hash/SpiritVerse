import webpush from 'web-push'
import { setupWebPush } from '../../../lib/push'
import { query } from '../../../lib/db'
import readings from '../../../data/readings'

const VERSE_INTERVAL_MINUTES = 120

export default async function handler(req, res) {
  // Simple secret check so this endpoint isn't publicly callable without configuration.
  const secret = req.query?.secret || req.headers?.['x-cron-secret']
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Missing or invalid secret' })
  }

  try {
    // Load approved suggestions
    let suggestions = []
    try {
      const r = await query('select id, scripture_ref, title, reading_text, reflection, author_name from verse_suggestions where status = $1', ['approved'])
      suggestions = (r.rows || []).map(s => ({
        id: s.id,
        scripture_ref: s.scripture_ref,
        title: s.title || s.scripture_ref,
        reading_text: s.reading_text,
        reflection: s.reflection,
        author_name: s.author_name,
      }))
    } catch (err) {
      console.error('Failed to load approved suggestions for send-all:', err)
    }

    const pool = [...readings, ...suggestions]
    if (pool.length === 0) {
      return res.status(200).json({ success: true, message: 'No readings available' })
    }

    // Pick the current quote using the same deterministic rotation as the UI
    const now = new Date()
    const cycleNumber = Math.floor(now.getTime() / (VERSE_INTERVAL_MINUTES * 60 * 1000))
    const seededRandom = Math.abs(Math.sin(cycleNumber * 12.9898) * 43758.5453) % 1
    const readingIndex = Math.floor(seededRandom * pool.length)
    const reading = pool[readingIndex]

    setupWebPush()

    // Fetch all subscriptions
    const subsResult = await query(
      `select s.endpoint, s.p256dh, s.auth, a.notification_schedule
       from push_subscriptions s
       join accounts a on a.id = s.user_id`,
    )
    const rows = subsResult.rows || []

    const hour = new Date().getHours()
    const scheduleActive = (schedule) => {
      if (schedule === 'every_2_hours') return true
      if (schedule === 'morning_evening') return (hour >= 6 && hour < 10) || (hour >= 17 && hour < 21)
      return true
    }
    const filteredRows = rows.filter((row) => scheduleActive(row.notification_schedule))

    const payload = JSON.stringify({
      title: reading.title || reading.scripture_ref || 'Daily Verse',
      body: reading.reading_text?.slice(0, 240) || '',
      url: '/',
    })

    const sendPromises = filteredRows.map((row) =>
      webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
      ).catch(err => {
        // Log individual failures but don't fail the whole job
        console.warn('Push send failed for subscription:', err && err.body ? err.body : err)
      }),
    )

    await Promise.allSettled(sendPromises)

    return res.status(200).json({ success: true, sent: filteredRows.length })
  } catch (err) {
    console.error('Failed to run send-all:', err)
    return res.status(500).json({ error: 'Failed to send notifications' })
  }
}
