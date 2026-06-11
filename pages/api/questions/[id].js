import { query } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM questions WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' })
      }
      return res.status(200).json({ question: result.rows[0] })
    } catch (err) {
      console.error('Failed to fetch question:', err)
      return res.status(500).json({ error: 'Failed to fetch question' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
