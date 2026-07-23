import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { recipesRouter } from './routes/recipes.js';

// The Express app is defined here but never started. `server/index.js` listens
// on a port for local dev; `api/index.js` hands the same app to Vercel as a
// serverless function. Both get identical behaviour from one definition.
const app = express();

// In production the client is served from the same domain as the API, so
// there is no cross-origin request to permit. Only dev needs this.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
}

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', recipesRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 forwards rejected promises from async handlers here automatically.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
