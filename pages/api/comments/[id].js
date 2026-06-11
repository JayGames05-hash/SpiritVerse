import { getUserFromRequest } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Missing comment id' })
  }

  if (req.method === 'PUT') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to edit comments.' })
    }

    const { text, status } = req.body || {}
    const existing = await query('select author_id from comments where id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' })
    }

    const comment = existing.rows[0]
    if (text && comment.author_id !== user.id) {
      return res.status(403).json({ error: 'You can only edit your own comments.' })
    }

    if (!text && !status) {
      return res.status(400).json({ error: 'Nothing to update.' })
    }

    const updates = []
    const values = []
    if (text) {
      values.push(text)
      updates.push(`text = $${values.length}`)
    }
    if (status) {
      values.push(status)
      updates.push(`status = $${values.length}`)
    }

    values.push(id)
    const result = await query(
      `update comments set ${updates.join(', ')}, updated_at = now() where id = $${values.length} returning *`,
      values,
    )
    return res.status(200).json({ comment: result.rows[0] })
  }

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to delete comments.' })
    }

    const existing = await query('select author_id from comments where id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' })
    }

    const comment = existing.rows[0]
    if (comment.author_id !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments.' })
    }

    await query('delete from comments where id = $1', [id])
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
