import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'saints.js')

async function readSaints() {
  // Use dynamic import to get the latest module
  const modulePath = 'file://' + dataFile
  delete require.cache[require.resolve(dataFile)]
  const mod = await import(modulePath)
  return mod.default || mod.saints || []
}

function writeSaints(arr) {
  const content = `const saints = ${JSON.stringify(arr, null, 2)}\n\nexport default saints\n`
  fs.writeFileSync(dataFile, content, 'utf8')
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
