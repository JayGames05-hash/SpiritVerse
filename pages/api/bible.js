export default async function handler(req, res) {
  const { book, chapter } = req.query
  if (!book || !chapter) {
    return res.status(400).json({ error: 'Missing book or chapter' })
  }

  try {
    // Proxy to bible-api.com for KJV text
    const ref = `${encodeURIComponent(book)}%20${encodeURIComponent(chapter)}`
    const apiUrl = `https://bible-api.com/${ref}?translation=kjv`
    const r = await fetch(apiUrl)
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      return res.status(r.status).json({ error: 'Bible API error', details: text })
    }
    const data = await r.json()
    return res.status(200).json(data)
  } catch (err) {
    console.error('Bible proxy failed:', err)
    return res.status(500).json({ error: 'Failed to fetch bible text' })
  }
}
