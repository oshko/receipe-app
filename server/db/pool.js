import 'dotenv/config';
import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.USER}@localhost:5432/recipe_app`;

// Parse the host out properly rather than pattern-matching the whole string —
// a connection URL may or may not carry a user, password, port or query, and
// a regex that assumes any of them silently mis-classifies the others.
function isLocalHost(url) {
  try {
    const { hostname } = new URL(url);
    return ['localhost', '127.0.0.1', '::1', ''].includes(hostname);
  } catch {
    return false;
  }
}

const isLocal = isLocalHost(connectionString);

export const pool = new pg.Pool({
  connectionString,

  // Hosted providers (Neon, Supabase) require TLS; a local socket doesn't
  // offer it at all. rejectUnauthorized stays on — these providers use
  // publicly trusted certificates, so there's no reason to disable it.
  ssl: isLocal ? false : { rejectUnauthorized: true },

  // A long-lived local server can happily hold a handful of connections.
  // Serverless is the opposite: many short-lived instances, each of which
  // would grab its own pool. One connection each, released quickly, is what
  // keeps the database's connection limit from being exhausted.
  max: isLocal ? 10 : 1,
  idleTimeoutMillis: isLocal ? 30_000 : 5_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err.message);
});

export const query = (text, params) => pool.query(text, params);
