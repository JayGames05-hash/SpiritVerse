export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { text } = req.body || {}
  if(!text) return res.status(400).json({ error: 'Missing text' })

  const banned = ['badword1','badword2','curse']
  const t = String(text).toLowerCase()
  const hits = banned.filter(w => t.includes(w))
  if(hits.length) return res.status(200).json({ blocked: true, hits })
  return res.status(200).json({ blocked: false })
}
