// Every network call the app makes lives here, so components never deal with
// fetch details, status codes or JSON parsing.

async function request(path, options) {
  const res = await fetch(path, options);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.errors?.join(', ') || body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export function fetchRecipes({ q = '', category = '', signal } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);

  const qs = params.toString();
  return request(`/api/recipes${qs ? `?${qs}` : ''}`, { signal });
}

export function fetchRecipe(id) {
  return request(`/api/recipes/${id}`);
}

export function fetchCategories() {
  return request('/api/categories');
}

export function createRecipe(recipe) {
  return request('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
}
