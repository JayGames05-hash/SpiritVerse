import fs from 'fs'
import path from 'path'

const dataFileJson = path.join(process.cwd(), 'data', 'saints.json')
const dataFileJs = path.join(process.cwd(), 'data', 'saints.js')

function ensureDataDir() {
  const dir = path.dirname(dataFileJson)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readSaints() {
  if (fs.existsSync(dataFileJson)) {
    const raw = fs.readFileSync(dataFileJson, 'utf8')
    return JSON.parse(raw)
  }

  if (fs.existsSync(dataFileJs)) {
    const mod = require(dataFileJs)
    return mod.default || mod.saints || mod || []
  }

  return []
}

function writeSaints(arr) {
  ensureDataDir()
  fs.writeFileSync(dataFileJson, JSON.stringify(arr, null, 2), 'utf8')
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const saints = await readSaints()
      return res.status(200).json({ saints })
    }

    if (req.method === 'POST') {
      const entry = req.body
      if (!entry || !entry.id) return res.status(400).json({ error: 'Missing entry or id' })
      const saints = await readSaints()
      if (saints.find(s => s.id === entry.id)) return res.status(409).json({ error: 'ID exists' })
      saints.push(entry)
      writeSaints(saints)
      return res.status(201).json({ saints })
    }

    if (req.method === 'PUT') {
      const entry = req.body
      if (!entry || !entry.id) return res.status(400).json({ error: 'Missing entry or id' })
      const saints = await readSaints()
      const idx = saints.findIndex(s => s.id === entry.id)
      if (idx === -1) return res.status(404).json({ error: 'Not found' })
      saints[idx] = entry
      writeSaints(saints)
      return res.status(200).json({ saints })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const saints = await readSaints()
      const filtered = saints.filter(s => s.id !== id)
      writeSaints(filtered)
      return res.status(200).json({ saints: filtered })
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE')
    res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    console.error('admin/saints error', err)
    res.status(500).json({ error: 'Server error' })
  }
}
