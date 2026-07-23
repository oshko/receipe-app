// Drops and rebuilds the recipes table, then loads the sample data.
// Run with: npm run seed
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool, query } from './pool.js';
import { sampleRecipes } from '../data/recipes.js';

const here = dirname(fileURLToPath(import.meta.url));

async function seed() {
  const schema = await readFile(join(here, 'schema.sql'), 'utf8');
  await query(schema);
  console.log('✔ schema created');

  for (const r of sampleRecipes) {
    await query(
      `INSERT INTO recipes
         (title, description, category, emoji, tags, ingredients, steps,
          prep_minutes, cook_minutes, servings, difficulty)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        r.title,
        r.description,
        r.category,
        r.emoji,
        r.tags,
        r.ingredients,
        r.steps,
        r.prep_minutes,
        r.cook_minutes,
        r.servings,
        r.difficulty,
      ]
    );
  }
  console.log(`✔ inserted ${sampleRecipes.length} recipes`);
}

seed()
  .catch((err) => {
    console.error('✖ seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
