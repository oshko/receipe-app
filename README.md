# PantryBook — Recipe App

A small full-stack recipe app: browse recipes, open one for the full method,
search by name/ingredient/cuisine, filter by category, and add your own.

- **Client** — React 19 + Vite + React Router (`client/`)
- **API** — Node + Express 5 (`server/`)
- **Database** — PostgreSQL, one `recipes` table (`server/db/`)

## Getting started

You need Node 18+ and a running PostgreSQL server.

```bash
createdb recipe_app          # once
npm install                  # npm workspaces: installs client + server
cp server/.env.example server/.env
npm run seed                 # creates the table and loads 20 recipes
npm run dev                  # API on :4000, client on :5173
```

Open http://localhost:5173. Vite proxies `/api` to the Express server, so the
browser only ever talks to one origin.

If `DATABASE_URL` in `server/.env` doesn't match your setup, edit it — the
default assumes Postgres on localhost with no password.

## How it fits together

```
browser ──fetch('/api/recipes?q=…')──> Vite proxy ──> Express ──> Postgres
```

| Path | Purpose |
| --- | --- |
| `client/src/pages/RecipeList.jsx` | List page: search box, category chips, card grid |
| `client/src/pages/RecipeDetail.jsx` | Single recipe: ingredients checklist + numbered method |
| `client/src/pages/AddRecipe.jsx` | Form that POSTs a new recipe |
| `client/src/api.js` | Every network call in the app |
| `server/app.js` | Express app definition — shared by local dev and Vercel |
| `server/routes/recipes.js` | HTTP layer: routing, validation, status codes |
| `api/index.js` | Vercel entry point; hands `server/app.js` to the serverless runtime |
| `server/db/queries.js` | SQL layer: all the queries live here |
| `server/data/recipes.js` | The 20 sample recipes |

### API

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/recipes?q=&category=` | Both filters optional, combined with AND |
| GET | `/api/recipes/:id` | 404 if it doesn't exist |
| GET | `/api/categories` | Category names with recipe counts |
| POST | `/api/recipes` | 400 with an `errors` array if invalid |

## Search

Search runs in Postgres, not in the browser: React debounces the input by
300ms and sends one request, and `buildSearchClause()` in
`server/db/queries.js` decides what counts as a match.

A term matches if it appears in the **title, description, category, tags or
ingredients** — so "avocado" finds Guacamole and "vegan" finds everything
tagged that way. Multi-word queries require *every* word to appear, though
each may match a different column: "chicken thai" finds the Thai green curry
because "thai" hits a tag while "chicken" hits the title.

Known limitation: matching is plain substring, so there is no stemming —
"egg" matches "egg yolks" but "eggs" does not. Postgres full-text search
(`to_tsvector`/`plainto_tsquery`) would fix that at the cost of a more
involved query and an index to maintain.

## Deploying to Vercel

The repo is laid out as a single Vercel project: the Vite build is served as
static files, and the whole Express app runs as one serverless function.

```
GET /                 -> client/dist/index.html   (static)
GET /assets/*         -> client/dist/assets/*     (static)
GET /api/recipes?q=…  -> api/index.js             (serverless)
```

`vercel.json` rewrites every `/api/*` path to the single function, and every
other unmatched path to `index.html` so React Router can handle it. Static
files are checked before rewrites apply, so assets are never swallowed.

### 1. Create the database

In the Vercel dashboard: **Storage → Create Database → Neon**. Vercel injects
`DATABASE_URL` into the project's environment variables for you — nothing to
copy by hand. Use the **pooled** connection string if offered a choice.

### 2. Seed it

The tables don't exist yet on a fresh Neon database. From your machine:

```bash
DATABASE_URL="<your neon connection string>" npm run seed
```

The shell variable takes priority over `server/.env`, so this only touches
production and leaves your local database alone.

### 3. Import the repo

In Vercel: **Add New → Project → Import** `oshko/receipe-app`. The settings in
`vercel.json` are picked up automatically — leave the framework preset alone.
Every later push to `main` redeploys.

### Notes on serverless

- `server/db/pool.js` caps the pool at **1 connection** in production. Each
  serverless instance gets its own pool, so a large `max` multiplied by many
  concurrent instances is how you exhaust a database's connection limit.
- TLS is required by Neon and unavailable locally, so the pool decides based
  on the connection URL's hostname.
- Cold starts are real: the first request after an idle period pays for
  booting Node and opening a database connection.
