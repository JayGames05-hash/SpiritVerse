import { randomBytes, createHmac } from 'crypto'
import { hash, compare } from 'bcryptjs'
import { query } from './db'
import fs from 'fs'
import path from 'path'

const SESSION_COOKIE_NAME = 'coptic_daily_readings_session'
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

// In development without a DATABASE_URL we persist a generated secret
// to `db/dev_session_secret` so signed cookies survive server restarts.
function loadOrCreateSessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  try {
    const secretPath = path.join(process.cwd(), 'db', 'dev_session_secret')
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim()
    }
    const secret = randomBytes(32).toString('hex')
    try {
      fs.writeFileSync(secretPath, secret, { flag: 'wx', mode: 0o600 })
    } catch (_) {
      // ignore write errors
    }
    return secret
  } catch (err) {
    return randomBytes(32).toString('hex')
  }
}

const SESSION_SECRET = loadOrCreateSessionSecret()

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signPayload(payload, expiresInSec) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payloadWithExp = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec }
  const encoded = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payloadWithExp))}`
  const sig = createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64')
  const sigUrl = sig.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encoded}.${sigUrl}`
}

function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sig] = parts
    const data = `${headerB64}.${payloadB64}`
    const expected = createHmac('sha256', SESSION_SECRET).update(data).digest('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
    if (expected !== sig) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch (err) {
    return null
  }
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.split('=')
    if (!name) return cookies
    cookies[name.trim()] = decodeURIComponent(rest.join('=').trim())
    return cookies
  }, {})
}

function createCookieHeader(name, value, maxAge) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export async function hashPassword(password) {
  return hash(password, 10)
}

export async function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword)
}

export async function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  return cookies[SESSION_COOKIE_NAME] || null
}

export async function getUserFromRequest(req) {
  const token = await getSessionToken(req)
  if (!token) return null

  // If a real DATABASE_URL is configured, validate session token against DB.
  if (process.env.DATABASE_URL) {
    const result = await query(
      `select id, email, saint_name, full_name, is_admin, verse_interval_hours, created_at
       from accounts
       where session_token = $1
         and session_expires_at > now()`,
      [token],
    )
    return result.rows[0] || null
  }

  // Otherwise (dev with in-memory DB or no DB), treat the cookie as a signed token
  const payload = verifyToken(token)
  if (!payload || !payload.user) return null
  return payload.user
}

export async function createSession(res, userId) {
  // If a real DB exists, keep server-side session tokens
  if (process.env.DATABASE_URL) {
    const token = randomBytes(24).toString('hex')
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()
    await query(
      'update accounts set session_token = $1, session_expires_at = $2 where id = $3',
      [token, expiresAt, userId],
    )
    res.setHeader('Set-Cookie', createCookieHeader(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE))
    return token
  }

  // Dev / no DB: create a signed token containing the serialized user
  let userRow = null
  try {
    const r = await query('select id, email, saint_name, full_name, is_admin, verse_interval_hours, created_at from accounts where id = $1', [userId])
    userRow = r.rows[0]
  } catch (err) {
    // ignore — may be missing if in-memory DB was reset
  }
  const userPayload = userRow ? serializeUser(userRow) : { id: userId }
  const token = signPayload({ user: userPayload }, SESSION_MAX_AGE)
  res.setHeader('Set-Cookie', createCookieHeader(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE))
  return token
}

export async function clearSession(req, res) {
  const token = await getSessionToken(req)
  if (process.env.DATABASE_URL) {
    if (token) {
      await query('update accounts set session_token = null, session_expires_at = null where session_token = $1', [token])
    }
  }
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  )
}

export function serializeUser(userRow) {
  if (!userRow) return null
  return {
    id: userRow.id,
    email: userRow.email,
    created_at: userRow.created_at || new Date().toISOString(),
    is_admin: !!userRow.is_admin,
    // Expose verse interval in minutes for finer control; fall back to 120m (2h)
    verse_interval_minutes: Number(userRow.verse_interval_minutes) || (Number(userRow.verse_interval_hours) ? Number(userRow.verse_interval_hours) * 60 : 120),
    user_metadata: {
      saint_name: userRow.saint_name,
      full_name: userRow.full_name,
    },
  }
}
