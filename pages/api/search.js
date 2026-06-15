import readings from '../../data/readings'
import saints from '../../data/saints'
import { query } from '../../lib/db'

export default async function handler(req, res) {
  const searchText = String(req.query.q || req.query.query || '').trim()
  if (!searchText) {
    return res.status(200).json({ results: [] })
  }

  const normalized = searchText.toLowerCase()
  const fuzzy = `%${normalized}%`

  const readingMatches = readings
    .filter((item) => {
      const fields = [item.title, item.scripture_ref, item.reading_text, item.reflection, item.saint, item.note]
      return fields.some((field) => field && field.toLowerCase().includes(normalized))
    })
    .map((item) => ({
      type: 'reading',
      id: item.id,
      title: item.title || item.scripture_ref,
      scripture_ref: item.scripture_ref,
      excerpt: item.reading_text,
      reflection: item.reflection,
      note: item.note,
    }))

  const saintMatches = saints
    .filter((item) => {
      const fields = [item.name, item.feast_date, item.note, item.title, item.reading_text, item.reflection]
      return fields.some((field) => field && field.toLowerCase().includes(normalized))
    })
    .map((item) => ({
      type: 'saint',
      id: item.id,
      title: item.name,
      feast_date: item.feast_date,
      scripture_ref: item.scripture_ref,
      excerpt: item.note,
      reflection: item.reflection,
    }))

  let suggestionMatches = []
  try {
    const result = await query(
      `select id, scripture_ref, title, reading_text, reflection, author_name, created_at
       from verse_suggestions
       where status = $1
         and (lower(scripture_ref) like $2 or lower(title) like $2 or lower(reading_text) like $2 or lower(reflection) like $2)
       order by created_at desc
       limit 20`,
      ['approved', fuzzy],
    )
    suggestionMatches = result.rows.map((item) => ({
      type: 'suggestion',
      id: item.id,
      title: item.title || item.scripture_ref,
      scripture_ref: item.scripture_ref,
      excerpt: item.reading_text,
      reflection: item.reflection,
      author_name: item.author_name,
    }))
  } catch (err) {
    console.error('Search query failed:', err)
  }

  const results = [...readingMatches, ...saintMatches, ...suggestionMatches]
  return res.status(200).json({ results })
}
