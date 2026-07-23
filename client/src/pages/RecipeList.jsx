import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchRecipes, fetchCategories } from '../api.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import RecipeCard from '../components/RecipeCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryChips from '../components/CategoryChips.jsx';

export default function RecipeList() {
  // Search state lives in the URL, so /?q=curry&category=Dinner is shareable
  // and the browser back button steps through previous searches.
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';

  const [term, setTerm] = useState(() => searchParams.get('q') || '');
  const debouncedTerm = useDebouncedValue(term, 300);

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchRecipes({ q: debouncedTerm, category, signal: controller.signal })
      .then((data) => {
        setRecipes(data);
        setStatus('ready');
      })
      .catch((err) => {
        // An aborted request is a superseded keystroke, not a failure.
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [debouncedTerm, category]);

  // Keep the URL in step with the debounced term rather than every keystroke,
  // otherwise every letter typed becomes its own history entry.
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedTerm) next.set('q', debouncedTerm);
    if (category) next.set('category', category);
    setSearchParams(next, { replace: true });
  }, [debouncedTerm, category, setSearchParams]);

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set('category', value) : next.delete('category');
    setSearchParams(next);
  };

  return (
    <>
      <section className="hero">
        <h1>What are you cooking today?</h1>
        <p>
          {categories.reduce((sum, c) => sum + c.count, 0)} recipes, searchable
          by name, ingredient or cuisine.
        </p>

        <SearchBar
          value={term}
          onChange={setTerm}
          isSearching={term !== debouncedTerm}
        />
        <CategoryChips
          categories={categories}
          active={category}
          onChange={setCategory}
        />
      </section>

      {status === 'error' && (
        <p className="empty">
          Couldn’t load recipes: {error}
          <br />
          <small>Is the API running on port 4000?</small>
        </p>
      )}

      {status !== 'error' && (
        <section className="results" aria-busy={status === 'loading'}>
          <p className="results-count">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            {debouncedTerm && <> matching “{debouncedTerm}”</>}
            {category && <> in {category}</>}
          </p>

          {recipes.length === 0 && status === 'ready' ? (
            <p className="empty">
              No recipes match that. Try a different word, or clear the filters.
            </p>
          ) : (
            <div className="grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
