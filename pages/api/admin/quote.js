import { getUserFromRequest } from '../../../lib/auth'
import readings from '../../../data/readings'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // For now, just return a random reading for testing
    const randomIndex = Math.floor(Math.random() * readings.length)
    const quote = readings[randomIndex]

    return res.status(200).json({ quote })
  } catch (err) {
    console.error('Failed to get random quote:', err)
    return res.status(500).json({ error: 'Failed to get random quote' })
  }
}
