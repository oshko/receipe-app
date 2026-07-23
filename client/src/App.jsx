import { Routes, Route, Link, NavLink } from 'react-router-dom';
import RecipeList from './pages/RecipeList.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import AddRecipe from './pages/AddRecipe.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">🍳</span>
          <span>
            Pantry<em>Book</em>
          </span>
        </Link>

        <nav className="site-nav">
          <NavLink to="/" end>
            Recipes
          </NavLink>
          <NavLink to="/new" className="nav-cta">
            Add recipe
          </NavLink>
        </nav>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/new" element={<AddRecipe />} />
          <Route
            path="*"
            element={
              <p className="empty">
                Nothing here. <Link to="/">Back to recipes</Link>
              </p>
            }
          />
        </Routes>
      </main>

      <footer className="site-footer">
        Built with React, Express and PostgreSQL.
      </footer>
    </div>
  );
}
