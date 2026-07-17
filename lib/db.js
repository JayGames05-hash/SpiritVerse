import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const connectionString = process.env.DATABASE_URL

// In production, DATABASE_URL is required
if (process.env.NODE_ENV === 'production' && !connectionString) {
  console.error('FATAL: Missing DATABASE_URL environment variable in production.')
  console.error('You must set DATABASE_URL to a valid PostgreSQL connection string.')
  console.error('Example: postgresql://user:password@host:5432/database')
  throw new Error('Missing DATABASE_URL')
}

let pool = null
let memPool = null
let schemaInitialized = false
let schemaInitPending = false

// Use global to persist memPool across module reloads in dev
if (typeof global !== 'undefined' && !global.__memPool) {
  global.__memPool = null
}

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  })
} else if (process.env.NODE_ENV !== 'production') {
  // No DATABASE_URL in dev — we'll lazily initialize an in-memory Postgres via pg-mem when first needed.
  // Use global to survive module reloads
  memPool = global.__memPool
}

async function initInMemory() {
  // Check global first (survives module reloads in dev)
  if (typeof global !== 'undefined' && global.__memPool) {
    memPool = global.__memPool
    return memPool
  }
  
  if (memPool) return memPool
  
  const { newDb } = await import('pg-mem')
  const { v4: uuidv4 } = await import('uuid')
  const db = newDb()

  // Provide gen_random_uuid() used by our schema
  db.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid',
    implementation: () => uuidv4(),
  })

  // Provide now() for timestamp defaults
  db.public.registerFunction({
    name: 'now',
    returns: 'timestamptz',
    implementation: () => new Date(),
  })

  // Create a pg-compatible driver and pool backed by the in-memory DB
  const pg = db.adapters.createPg()
  memPool = new pg.Pool()

  // Store in global to survive module reloads
  if (typeof global !== 'undefined') {
    global.__memPool = memPool
  }

  // Load and run schema.sql so the in-memory DB has the same tables
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql')
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8')
    // Run schema statements one by one for better error handling
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    for (const statement of statements) {
      await memPool.query(statement + ';')
    }
  } catch (err) {
    // If schema loading fails, surface a helpful error
    console.error('Failed to initialize in-memory database:', err)
    throw err
  }

  return memPool
}

async function initializeSchema() {
  // Only run for real database connections
  if (!pool) return

  // Avoid running this in parallel
  if (schemaInitPending) {
    while (schemaInitPending) {
      await new Promise(r => setTimeout(r, 100))
    }
    return
  }

  if (schemaInitialized) return

  schemaInitPending = true
  try {
    // Check whether required tables already exist.
    const requiredTables = ['accounts', 'feature_events', 'comments', 'reactions', 'questions', 'answers', 'verse_suggestions', 'favorites', 'push_subscriptions', 'user_history']
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [requiredTables],
    )
    const existingTables = new Set(result.rows.map(row => row.table_name))
    const missingTables = requiredTables.filter(name => !existingTables.has(name))

    if (missingTables.length === 0) {
      // Ensure any new columns are created even if the table already exists.
      await pool.query('alter table accounts add column if not exists verse_interval_minutes integer default 120')
    await pool.query("alter table accounts add column if not exists notification_schedule text default 'every_2_hours'")
    await pool.query('create table if not exists feature_events (id uuid primary key default gen_random_uuid(), user_id uuid references accounts(id), event_type text not null, metadata jsonb, created_at timestamptz default now())')
      try {
        await pool.query("update accounts set verse_interval_minutes = verse_interval_hours * 60 where verse_interval_minutes is null and verse_interval_hours is not null")
      } catch (e) {
        // ignore if column doesn't exist
      }
      schemaInitialized = true
      return
    }

    console.log('Initializing missing database tables...', missingTables)
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    for (const statement of statements) {
      try {
        await pool.query(statement + ';')
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          throw err
        }
      }
    }
    await pool.query('alter table accounts add column if not exists verse_interval_minutes integer default 120')
    // Backfill from old hours column if present
    try {
      await pool.query("update accounts set verse_interval_minutes = verse_interval_hours * 60 where verse_interval_minutes is null and verse_interval_hours is not null")
    } catch (e) {
      // ignore
    }
    console.log('Database schema initialized successfully')
    // Optionally grant admin to a specific email. Use ADMIN_EMAIL env var or default to JayGames.05@outlook.com
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'JayGames.05@outlook.com'
      await pool.query('update accounts set is_admin = true where email = $1', [adminEmail])
      console.log(`Ensured admin privileges for ${adminEmail}`)
    } catch (err) {
      console.warn('Failed to set admin user:', err.message || err)
    }
    schemaInitialized = true
  } catch (err) {
    console.error('Failed to initialize database schema:', err)
    schemaInitialized = true // Mark as done even on error to prevent infinite loops
    throw err
  } finally {
    schemaInitPending = false
  }
}

export async function query(text, params) {
  // Prefer real DB when configured
  if (pool) {
    // Initialize schema on first real database connection
    await initializeSchema()
    try {
      return await pool.query(text, params)
    } catch (error) {
      // If connection refused in dev, fall back to in-memory DB
      if (error?.code === 'ECONNREFUSED' && process.env.NODE_ENV !== 'production') {
        console.warn('Database connection refused; falling back to in-memory DB')
        const p = await initInMemory()
        return await p.query(text, params)
      }
      throw error
    }
  }

  // No real DB configured — use in-memory (dev only)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing DATABASE_URL environment variable. Set DATABASE_URL to a PostgreSQL connection string.')
  }

  const p = await initInMemory()
  return await p.query(text, params)
}
