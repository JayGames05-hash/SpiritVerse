import { query } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req, res) {
  const { questionId } = req.query

  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM answers WHERE question_id = $1 ORDER BY created_at DESC',
        [questionId]
      )
      return res.status(200).json({ answers: result.rows })
    } catch (err) {
      console.error('Failed to fetch answers:', err)
      return res.status(500).json({ error: 'Failed to fetch answers' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await getUserFromRequest(req)
      if (!user) {
        console.error('No user found in request')
        return res.status(401).json({ error: 'Unauthorized - please sign in' })
      }

      const { content } = req.body
      if (!content) {
        console.error('Missing content')
        return res.status(400).json({ error: 'Content is required' })
      }

      console.log('Creating answer for user:', user.id, user.email)
      const result = await query(
        'INSERT INTO answers (question_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *',
        [questionId, user.id, user.full_name || user.email, content]
      )

      console.log('Answer created successfully:', result.rows[0].id)
      return res.status(201).json({ answer: result.rows[0] })
    } catch (err) {
      console.error('Failed to create answer:', err.message || err)
      return res.status(500).json({ error: 'Failed to create answer: ' + (err.message || 'Unknown error') })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
