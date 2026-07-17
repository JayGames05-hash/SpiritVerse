import { hashPassword } from '../../../lib/auth'
import { createSession, serializeUser } from '../../../lib/auth'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await query('select id from accounts where email = $1', [normalizedEmail])
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email already registered.' })
  }

  // server-side random saint assignment
  const saints = [
    'Abraham','Sarah','Isaac','Jacob','Moses','Aaron','Joshua','Deborah','Samuel','David','Solomon','Elijah','Elisha','Isaiah','Jeremiah','Ezekiel','Daniel','Hosea','Joel','Amos','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Mary','Joseph','John the Baptist','Peter','James','John','Paul','Philip','Stephen','Barnabas','Timothy','Lydia','Priscilla','Aquila','Mary Magdalene','Martha','Lazarus','Ruth','Esther'
  ]
  const assignedSaint = saints[Math.floor(Math.random() * saints.length)]

  const password_hash = await hashPassword(password)
  const fullName = assignedSaint
  const result = await query(
    'insert into accounts (email, saint_name, full_name, password_hash) values ($1, $2, $3, $4) returning id, email, saint_name, full_name, verse_interval_minutes, notification_schedule',
    [normalizedEmail, fullName, fullName, password_hash],
  )

  const userRow = result.rows[0]
  await createSession(res, userRow.id)
  return res.status(200).json({ user: serializeUser(userRow) })
}
