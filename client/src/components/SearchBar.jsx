export default function SearchBar({ value, onChange, isSearching }) {
  return (
    <div className="searchbar">
      <span className="searchbar-icon" aria-hidden="true">
        🔍
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recipes, ingredients, cuisines…"
        aria-label="Search recipes"
        autoComplete="off"
      />

      {value && (
        <button
          type="button"
          className="searchbar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

      {isSearching && <span className="searchbar-spinner" aria-hidden="true" />}
    </div>
  );
}
