import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await query(
      `select a.*, q.title as question_title
       from answers a
       left join questions q on q.id = a.question_id
       where a.author_id = $1
       order by a.created_at desc`,
      [user.id],
    )
    return res.status(200).json({ answers: result.rows })
  } catch (err) {
    console.error('Failed to fetch user answers:', err)
    return res.status(500).json({ error: 'Failed to fetch user answers' })
  }
}
