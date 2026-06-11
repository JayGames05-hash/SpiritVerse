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

export async function query(text, params) {
  // Prefer real DB when configured
  if (pool) {
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
