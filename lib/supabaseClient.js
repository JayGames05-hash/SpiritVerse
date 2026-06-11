import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const useRemote = Boolean(supabaseUrl && supabaseAnonKey)

if (!useRemote && typeof window !== 'undefined') {
  console.warn(
    'Supabase/Postgres is not configured. The app is using localStorage fallback. To persist data to Postgres, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
  )
}

const storageKey = 'coptic-daily-readings-local-db'
const defaultDb = {
  accounts: [],
  comments: [],
  reactions: [],
  currentUserId: null,
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function loadLocalDb() {
  if (!isBrowser()) return { ...defaultDb }
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return { ...defaultDb }
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      reactions: Array.isArray(parsed.reactions) ? parsed.reactions : [],
      currentUserId: parsed.currentUserId || null,
    }
  } catch {
    return { ...defaultDb }
  }
}

function saveLocalDb(db) {
  if (!isBrowser()) return// do nothing on server
  window.localStorage.setItem(storageKey, JSON.stringify(db))
}

function getId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function normalizeUser(user) {
  if (!user) return null
  return {
    ...user,
    user_metadata: user.user_metadata || {},
  }
}

function loadAccounts() {
  return loadLocalDb().accounts
}

function saveAccounts(accounts) {
  const db = loadLocalDb()
  db.accounts = accounts
  saveLocalDb(db)
}

function findAccountByEmail(email) {
  if (!email) return null
  const normalizedEmail = email.toLowerCase()
  return loadAccounts().find((account) => account.email === normalizedEmail) || null
}

function findAccountById(id) {
  if (!id) return null
  return loadAccounts().find((account) => account.id === id) || null
}

function getCurrentUser() {
  const db = loadLocalDb()
  if (!db.currentUserId) return null
  return normalizeUser(findAccountById(db.currentUserId))
}

function saveCurrentUserId(id) {
  const db = loadLocalDb()
  db.currentUserId = id
  saveLocalDb(db)
}

function createAccount({ email, password, saint_name }) {
  const normalizedEmail = email.toLowerCase()
  if (findAccountByEmail(normalizedEmail)) {
    return { data: null, error: { message: 'Email already registered.' } }
  }

  const account = {
    id: getId(),
    email: normalizedEmail,
    password,
    user_metadata: { saint_name, full_name: saint_name },
  }

  saveAccounts([...loadAccounts(), account])
  saveCurrentUserId(account.id)
  emitAuthEvent('SIGNED_IN', { user: normalizeUser(account) })
  return { data: { user: normalizeUser(account) }, error: null }
}

function signInAccount({ email, password }) {
  const normalizedEmail = email.toLowerCase()
  const account = findAccountByEmail(normalizedEmail)
  if (!account || account.password !== password) {
    return { data: null, error: { message: 'Invalid email or password.' } }
  }

  saveCurrentUserId(account.id)
  emitAuthEvent('SIGNED_IN', { user: normalizeUser(account) })
  return { data: { user: normalizeUser(account) }, error: null }
}

const authListeners = new Set()

function emitAuthEvent(event, session) {
  authListeners.forEach((listener) => {
    try {
      listener.callback(event, session)
    } catch (error) {
      console.error('auth listener failed', error)
    }
  })
}

function createAuthSubscription(callback) {
  const listener = { callback }
  authListeners.add(listener)
  return {
    data: {
      subscription: {
        unsubscribe() {
          authListeners.delete(listener)
        },
      },
    },
  }
}

function localQuery(table) {
  let mode = 'select'
  let conditions = []
  let orderSpec = null
  let limitCount = null
  let payload = null
  let singleMode = false
  let countMode = false

  const matchRow = (row) =>
    conditions.every(({ field, value }) => row[field] === value)

  const runSelect = () => {
    const db = loadLocalDb()
    let result = (db[table] || []).slice()
    result = result.filter(matchRow)

    if (orderSpec) {
      const { field, ascending } = orderSpec
      result.sort((a, b) => {
        const aVal = a[field] ?? ''
        const bVal = b[field] ?? ''
        if (aVal < bVal) return ascending ? -1 : 1
        if (aVal > bVal) return ascending ? 1 : -1
        return 0
      })
    }

    if (limitCount != null) {
      result = result.slice(0, limitCount)
    }

    const data = singleMode ? result[0] ?? null : result
    return {
      data,
      count: countMode ? (singleMode ? (data ? 1 : 0) : result.length) : undefined,
      error: null,
    }
  }

  const runInsert = () => {
    const db = loadLocalDb()
    const rows = Array.isArray(payload) ? payload : [payload]
    const now = new Date().toISOString()
    const inserted = rows.map((row) => ({
      id: row.id || getId(),
      created_at: row.created_at || now,
      updated_at: row.updated_at || now,
      ...row,
    }))

    db[table] = [...(db[table] || []), ...inserted]
    saveLocalDb(db)
    const data = singleMode ? inserted[0] : inserted
    return { data, error: null }
  }

  const runUpdate = () => {
    const db = loadLocalDb()
    const updatedRows = []
    db[table] = (db[table] || []).map((row) => {
      if (matchRow(row)) {
        const next = {
          ...row,
          ...payload,
          updated_at: new Date().toISOString(),
        }
        updatedRows.push(next)
        return next
      }
      return row
    })
    saveLocalDb(db)
    const data = singleMode ? updatedRows[0] ?? null : updatedRows
    return { data, error: null }
  }

  const runDelete = () => {
    const db = loadLocalDb()
    const removed = []
    const keep = []

    ;(db[table] || []).forEach((row) => {
      if (matchRow(row)) {
        removed.push(row)
      } else {
        keep.push(row)
      }
    })

    db[table] = keep
    saveLocalDb(db)
    const data = singleMode ? removed[0] ?? null : removed
    return { data, error: null }
  }

  const runQuery = async () => {
    if (mode === 'select') return runSelect()
    if (mode === 'insert') return runInsert()
    if (mode === 'update') return runUpdate()
    if (mode === 'delete') return runDelete()
    return { data: null, error: { message: 'Invalid query mode' } }
  }

  const query = {
    eq(field, value) {
      conditions.push({ field, value })
      return query
    },
    order(field, { ascending = true } = {}) {
      orderSpec = { field, ascending }
      return query
    },
    limit(n) {
      limitCount = n
      return query
    },
    select(_columns = '*', opts) {
      countMode = opts?.count === 'exact'
      return query
    },
    insert(rows) {
      mode = 'insert'
      payload = rows
      return query
    },
    update(values) {
      mode = 'update'
      payload = values
      return query
    },
    delete() {
      mode = 'delete'
      return query
    },
    single() {
      singleMode = true
      return query
    },
    then(onFulfilled, onRejected) {
      return runQuery().then(onFulfilled, onRejected)
    },
  }

  return query
}

const localSupabase = {
  auth: {
    getUser: async () => ({
      data: {
        user: normalizeUser(getCurrentUser()),
      },
      error: null,
    }),
    signUp: async ({ email, password }, { options } = {}) => {
      if (!email || !password) {
        return { data: null, error: { message: 'Email and password are required.' } }
      }
      const saintName = options?.data?.saint_name || email
      return createAccount({ email, password, saint_name: saintName })
    },
    signInWithPassword: async ({ email, password }) => {
      if (!email || !password) {
        return { data: null, error: { message: 'Email and password are required.' } }
      }
      return signInAccount({ email, password })
    },
    signInWithOtp: async ({ email }) => {
      if (!email) {
        return { data: null, error: { message: 'Email is required.' } }
      }
      const db = loadLocalDb()
      let user = db.accounts.find((account) => account.email === email)
      if (!user) {
        const id = getId()
        user = {
          id,
          email,
          password: '',
          user_metadata: { saint_name: email, full_name: email },
        }
        db.accounts.push(user)
      }
      db.currentUserId = user.id
      saveLocalDb(db)
      emitAuthEvent('SIGNED_IN', { user: normalizeUser(user) })
      return { data: { user: normalizeUser(user) }, error: null }
    },
    signOut: async () => {
      saveCurrentUserId(null)
      emitAuthEvent('SIGNED_OUT', { session: null })
      return { data: null, error: null }
    },
    onAuthStateChange: createAuthSubscription,
  },
  from: localQuery,
}

export const supabase = useRemote
  ? createClient(supabaseUrl, supabaseAnonKey)
  : localSupabase
