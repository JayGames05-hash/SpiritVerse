import { getUserFromRequest } from '../../../lib/auth'
import readings from '../../../data/readings'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Load approved suggestions and include them in the pool so admin testing
    // reflects what users see in rotation.
    let suggestions = []
    try {
      const res = await query(
        'select id, scripture_ref, title, reading_text, reflection, author_name from verse_suggestions where status = $1',
        ['approved'],
      )
      suggestions = (res.rows || []).map(s => ({
        id: s.id,
        scripture_ref: s.scripture_ref,
        title: s.title || s.scripture_ref,
        reading_text: s.reading_text,
        reflection: s.reflection,
        author_name: s.author_name,
      }))
    } catch (err) {
      console.error('Failed to load approved suggestions for admin quote:', err)
    }

    const pool = [...readings, ...suggestions]
    const randomIndex = Math.floor(Math.random() * pool.length)
    const quote = pool[randomIndex]

    return res.status(200).json({ quote })
  } catch (err) {
    console.error('Failed to get random quote:', err)
    return res.status(500).json({ error: 'Failed to get random quote' })
  }
}
