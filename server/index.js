// Local development entry point. Vercel never runs this file — it imports the
// app directly through api/index.js instead.
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
