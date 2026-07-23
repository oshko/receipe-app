import { query } from './pool.js';

const RECIPE_COLUMNS = `
  id, title, description, category, emoji, tags, ingredients, steps,
  prep_minutes, cook_minutes, servings, difficulty
`;

/**
 * Build the SQL WHERE fragment that decides whether a recipe matches the
 * user's search term.
 *
 * ── YOUR CALL ────────────────────────────────────────────────────────────────
 * This is the heart of the search feature and there is no single right answer.
 * Things worth deciding:
 *
 *   • WHICH COLUMNS COUNT AS A MATCH?  Searching only `title` is predictable
 *     ("pizza" finds Pizza). Also searching `ingredients` is far more useful
 *     ("avocado" finds Guacamole) but noisier — "butter" then matches half the
 *     database. `description`, `tags` and `category` are all candidates too.
 *
 *   • MULTI-WORD TERMS.  "green curry" as one LIKE pattern only matches that
 *     exact phrase. Splitting on whitespace and requiring every word (AND) is
 *     forgiving about word order; requiring any word (OR) returns much more,
 *     much of it irrelevant.
 *
 * Arrays need converting before ILIKE can see them:
 *     array_to_string(ingredients, ' ') ILIKE $1
 *
 * Return `null` to mean "no filter" — the app stays functional while you work.
 *
 * @param   {string} term       Trimmed, non-empty search text from ?q=
 * @param   {number} nextParam  1-based index of the next free $n placeholder
 * @returns {{ sql: string, params: any[] } | null}
 *
 * Example of the shape expected back:
 *     { sql: '(title ILIKE $1)', params: ['%pizza%'] }
 */
export function buildSearchClause(term, nextParam) {
  const words = term.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const params = [];

  const perWord = words.map((word) => {
    // % and _ are LIKE wildcards. Without escaping them, a search for "100%"
    // would match everything, and "_" would match any single character.
    // Backslash is LIKE's default escape character, so no ESCAPE clause.
    const escaped = word.replace(/[\\%_]/g, (char) => `\\${char}`);
    params.push(`%${escaped}%`);
    const p = `$${nextParam + params.length - 1}`;

    return `(
      title ILIKE ${p}
      OR description ILIKE ${p}
      OR category ILIKE ${p}
      OR array_to_string(tags, ' ') ILIKE ${p}
      OR array_to_string(ingredients, ' ') ILIKE ${p}
    )`;
  });

  // Every word must appear somewhere (AND), but each is free to match a
  // different column: "chicken thai" finds the Thai curry because "thai" hits
  // a tag while "chicken" hits the title. OR across words would instead return
  // every chicken recipe plus every Thai recipe, which is far too much.
  return { sql: perWord.join(' AND '), params };
}

/**
 * List recipes, optionally narrowed by a search term and/or a category.
 * Both filters compose: ?q=chicken&category=Dinner applies each as its own
 * AND-ed condition.
 */
export async function listRecipes({ q = '', category = '' } = {}) {
  const conditions = [];
  const params = [];

  const term = q.trim();
  if (term) {
    const clause = buildSearchClause(term, params.length + 1);
    if (clause) {
      conditions.push(clause.sql);
      params.push(...clause.params);
    }
  }

  if (category.trim()) {
    params.push(category.trim());
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${RECIPE_COLUMNS} FROM recipes ${where} ORDER BY id`,
    params
  );
  return rows;
}

export async function getRecipeById(id) {
  const { rows } = await query(
    `SELECT ${RECIPE_COLUMNS} FROM recipes WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function listCategories() {
  const { rows } = await query(
    `SELECT category, COUNT(*)::int AS count
       FROM recipes
      GROUP BY category
      ORDER BY category`
  );
  return rows;
}

export async function createRecipe(recipe) {
  const { rows } = await query(
    `INSERT INTO recipes
       (title, description, category, emoji, tags, ingredients, steps,
        prep_minutes, cook_minutes, servings, difficulty)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING ${RECIPE_COLUMNS}`,
    [
      recipe.title,
      recipe.description,
      recipe.category,
      recipe.emoji,
      recipe.tags,
      recipe.ingredients,
      recipe.steps,
      recipe.prep_minutes,
      recipe.cook_minutes,
      recipe.servings,
      recipe.difficulty,
    ]
  );
  return rows[0];
}
