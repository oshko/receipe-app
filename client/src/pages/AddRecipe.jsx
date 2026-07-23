import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRecipe } from '../api.js';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const BLANK = {
  title: '',
  description: '',
  category: 'Dinner',
  emoji: '🍽️',
  tags: '',
  ingredients: '',
  steps: '',
  prep_minutes: 10,
  cook_minutes: 20,
  servings: 2,
  difficulty: 'Easy',
};

export default function AddRecipe() {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // One handler for every field: inputs are matched to state keys by name.
  const update = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    try {
      // The server splits the free-text fields into arrays and validates
      // again — client-side checks are for speed, not for trust.
      const created = await createRecipe(form);
      navigate(`/recipes/${created.id}`);
    } catch (err) {
      setErrors(err.message.split(', '));
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Link to="/" className="back-link">
        ← All recipes
      </Link>
      <h1>Add a recipe</h1>

      {errors.length > 0 && (
        <ul className="form-errors" role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <label className="field">
        <span>Title</span>
        <input name="title" value={form.title} onChange={update} required />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          rows={2}
          value={form.description}
          onChange={update}
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Category</span>
          <select name="category" value={form.category} onChange={update}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Difficulty</span>
          <select name="difficulty" value={form.difficulty} onChange={update}>
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>

        <label className="field field-narrow">
          <span>Emoji</span>
          <input name="emoji" value={form.emoji} onChange={update} maxLength={4} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Prep (min)</span>
          <input
            type="number"
            name="prep_minutes"
            min="0"
            value={form.prep_minutes}
            onChange={update}
          />
        </label>

        <label className="field">
          <span>Cook (min)</span>
          <input
            type="number"
            name="cook_minutes"
            min="0"
            value={form.cook_minutes}
            onChange={update}
          />
        </label>

        <label className="field">
          <span>Servings</span>
          <input
            type="number"
            name="servings"
            min="1"
            value={form.servings}
            onChange={update}
          />
        </label>
      </div>

      <label className="field">
        <span>Tags</span>
        <input
          name="tags"
          value={form.tags}
          onChange={update}
          placeholder="Italian, Quick, Vegetarian"
        />
        <small>Comma separated</small>
      </label>

      <label className="field">
        <span>Ingredients</span>
        <textarea
          name="ingredients"
          rows={6}
          value={form.ingredients}
          onChange={update}
          placeholder={'200g flour\n2 eggs\n1 tsp salt'}
        />
        <small>One per line</small>
      </label>

      <label className="field">
        <span>Method</span>
        <textarea
          name="steps"
          rows={6}
          value={form.steps}
          onChange={update}
          placeholder={'Heat the oven to 200C.\nMix everything.\nBake 20 minutes.'}
        />
        <small>One step per line</small>
      </label>

      <button type="submit" className="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save recipe'}
      </button>
    </form>
  );
}
