import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getUserFromRequest(req)
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const [suggestionsPending, suggestionsApproved, commentsTotal, usersTotal, favoritesTotal, eventsTotal] = await Promise.all([
      query('select count(*) as count from verse_suggestions where status = $1', ['pending']),
      query('select count(*) as count from verse_suggestions where status = $1', ['approved']),
      query('select count(*) as count from comments', []),
      query('select count(*) as count from accounts', []),
      query('select count(*) as count from favorites', []),
      query('select count(*) as count from feature_events', []),
    ])

    return res.status(200).json({
      metrics: {
        pendingSuggestions: Number(suggestionsPending.rows[0].count || 0),
        approvedSuggestions: Number(suggestionsApproved.rows[0].count || 0),
        commentsTotal: Number(commentsTotal.rows[0].count || 0),
        usersTotal: Number(usersTotal.rows[0].count || 0),
        favoritesTotal: Number(favoritesTotal.rows[0].count || 0),
        featureEventsTotal: Number(eventsTotal.rows[0].count || 0),
      },
    })
  } catch (err) {
    console.error('Failed to fetch admin metrics:', err)
    return res.status(500).json({ error: 'Failed to fetch metrics' })
  }
}
