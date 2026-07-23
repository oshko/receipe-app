import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipe } from '../api.js';
import { formatMinutes } from '../components/RecipeCard.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  // Ticking off ingredients is throwaway UI state — deliberately not persisted.
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    setRecipe(null);
    setError(null);
    setChecked(new Set());

    fetchRecipe(id).then(setRecipe).catch((err) => setError(err.message));
  }, [id]);

  const toggle = (index) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });

  if (error) {
    return (
      <p className="empty">
        {error}
        <br />
        <Link to="/">Back to all recipes</Link>
      </p>
    );
  }

  if (!recipe) return <p className="empty">Loading…</p>;

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        ← All recipes
      </Link>

      <header className="detail-header">
        <div className="detail-thumb" aria-hidden="true">
          {recipe.emoji}
        </div>

        <div>
          <span className="card-category">{recipe.category}</span>
          <h1>{recipe.title}</h1>
          <p className="detail-desc">{recipe.description}</p>

          <ul className="tag-row">
            {recipe.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <dl className="stat-row">
        <div>
          <dt>Prep</dt>
          <dd>{formatMinutes(recipe.prep_minutes)}</dd>
        </div>
        <div>
          <dt>Cook</dt>
          <dd>{formatMinutes(recipe.cook_minutes)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMinutes(recipe.prep_minutes + recipe.cook_minutes)}</dd>
        </div>
        <div>
          <dt>Serves</dt>
          <dd>{recipe.servings}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{recipe.difficulty}</dd>
        </div>
      </dl>

      <div className="detail-columns">
        <section>
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((item, i) => (
              <li key={i}>
                <label className={checked.has(i) ? 'checked' : ''}>
                  <input
                    type="checkbox"
                    checked={checked.has(i)}
                    onChange={() => toggle(i)}
                  />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Method</h2>
          <ol className="step-list">
            {recipe.steps.map((step, i) => (
              <li key={i}>
                <span className="step-number">{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
