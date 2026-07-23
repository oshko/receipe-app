import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  const totalMinutes = recipe.prep_minutes + recipe.cook_minutes;

  return (
    <Link to={`/recipes/${recipe.id}`} className="card">
      <div className="card-thumb" aria-hidden="true">
        <span>{recipe.emoji}</span>
      </div>

      <div className="card-body">
        <span className="card-category">{recipe.category}</span>
        <h3 className="card-title">{recipe.title}</h3>
        <p className="card-desc">{recipe.description}</p>

        <div className="card-meta">
          <span>⏱ {formatMinutes(totalMinutes)}</span>
          <span>🍽 {recipe.servings}</span>
          <span className={`pill pill-${recipe.difficulty.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function formatMinutes(total) {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}
