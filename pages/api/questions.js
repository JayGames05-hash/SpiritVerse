import { query } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM questions ORDER BY created_at DESC')
      return res.status(200).json({ questions: result.rows })
    } catch (err) {
      console.error('Failed to fetch questions:', err)
      return res.status(500).json({ error: 'Failed to fetch questions' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await getUserFromRequest(req)
      if (!user) {
        console.error('No user found in request')
        return res.status(401).json({ error: 'Unauthorized - please sign in' })
      }

      const { title, content } = req.body
      if (!title || !content) {
        console.error('Missing title or content:', { title, content })
        return res.status(400).json({ error: 'Title and content are required' })
      }

      console.log('Creating question for user:', user.id, user.email)
      const result = await query(
        'INSERT INTO questions (author_id, author_name, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, user.full_name || user.email, title, content]
      )

      console.log('Question created successfully:', result.rows[0].id)
      return res.status(201).json({ question: result.rows[0] })
    } catch (err) {
      console.error('Failed to create question:', err.message || err)
      return res.status(500).json({ error: 'Failed to create question: ' + (err.message || 'Unknown error') })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
