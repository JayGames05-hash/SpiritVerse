export default async function handler(req, res) {
  const { ref, book, chapter } = req.query
  const reference = ref || (book && chapter ? `${book} ${chapter}` : null)

  if (!reference) {
    return res.status(400).json({ error: 'Missing Bible reference' })
  }

  try {
    const encodedRef = encodeURIComponent(reference)
    const apiUrl = `https://bible-api.com/${encodedRef}?translation=kjv`
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
