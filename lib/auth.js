import { randomBytes } from 'crypto'
import { hash, compare } from 'bcryptjs'
import { query } from './db'

const SESSION_COOKIE_NAME = 'coptic_daily_readings_session'
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

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

  const result = await query(
    `select id, email, saint_name, full_name
     from accounts
     where session_token = $1
       and session_expires_at > now()`,
    [token],
  )

  return result.rows[0] || null
}

export async function createSession(res, userId) {
  const token = randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()
  await query(
    'update accounts set session_token = $1, session_expires_at = $2 where id = $3',
    [token, expiresAt, userId],
  )
  res.setHeader('Set-Cookie', createCookieHeader(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE))
  return token
}

export async function clearSession(req, res) {
  const token = await getSessionToken(req)
  if (token) {
    await query('update accounts set session_token = null, session_expires_at = null where session_token = $1', [token])
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
    user_metadata: {
      saint_name: userRow.saint_name,
      full_name: userRow.full_name,
    },
  }
}
