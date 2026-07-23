import { Router } from 'express';
import {
  listRecipes,
  getRecipeById,
  listCategories,
  createRecipe,
} from '../db/queries.js';

export const recipesRouter = Router();

// GET /api/recipes?q=chicken&category=Dinner
recipesRouter.get('/recipes', async (req, res) => {
  const recipes = await listRecipes({
    q: String(req.query.q || ''),
    category: String(req.query.category || ''),
  });
  res.json(recipes);
});

// GET /api/categories  ->  [{ category: 'Dinner', count: 9 }, ...]
recipesRouter.get('/categories', async (_req, res) => {
  res.json(await listCategories());
});

// GET /api/recipes/:id
recipesRouter.get('/recipes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Recipe id must be a positive integer' });
  }

  const recipe = await getRecipeById(id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

/**
 * Normalise and validate the request body for a new recipe.
 * Returns { errors: [] , value } — the caller decides what to do with errors.
 */
function validateRecipe(body = {}) {
  const errors = [];
  const text = (v) => (typeof v === 'string' ? v.trim() : '');

  // The form sends ingredients/steps/tags as newline- or comma-separated text;
  // the DB wants real arrays, so split here at the boundary.
  const toList = (v, sep) => {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    return text(v)
      .split(sep)
      .map((x) => x.trim())
      .filter(Boolean);
  };

  const value = {
    title: text(body.title),
    description: text(body.description),
    category: text(body.category) || 'Dinner',
    emoji: text(body.emoji) || '🍽️',
    tags: toList(body.tags, ','),
    ingredients: toList(body.ingredients, '\n'),
    steps: toList(body.steps, '\n'),
    prep_minutes: Number(body.prep_minutes) || 0,
    cook_minutes: Number(body.cook_minutes) || 0,
    servings: Number(body.servings) || 1,
    difficulty: text(body.difficulty) || 'Easy',
  };

  if (value.title.length < 3) errors.push('Title must be at least 3 characters');
  if (value.description.length < 10)
    errors.push('Description must be at least 10 characters');
  if (value.ingredients.length === 0) errors.push('Add at least one ingredient');
  if (value.steps.length === 0) errors.push('Add at least one step');
  if (!['Easy', 'Medium', 'Hard'].includes(value.difficulty))
    errors.push('Difficulty must be Easy, Medium or Hard');

  return { errors, value };
}

// POST /api/recipes
recipesRouter.post('/recipes', async (req, res) => {
  const { errors, value } = validateRecipe(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const created = await createRecipe(value);
  res.status(201).json(created);
});
