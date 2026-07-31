import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await query(
      `select id, title, body, url, created_at
       from announcements
       order by created_at desc
       limit 50`,
      [],
    )

    return res.status(200).json({ announcements: result.rows })
  } catch (err) {
    console.error('Failed to fetch announcements:', err)
    return res.status(500).json({ error: 'Failed to fetch announcements' })
  }
}
