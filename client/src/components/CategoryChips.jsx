export default function CategoryChips({ categories, active, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Filter by category">
      <button
        type="button"
        className={`chip ${active === '' ? 'chip-active' : ''}`}
        aria-pressed={active === ''}
        onClick={() => onChange('')}
      >
        All
      </button>

      {categories.map(({ category, count }) => (
        <button
          key={category}
          type="button"
          className={`chip ${active === category ? 'chip-active' : ''}`}
          aria-pressed={active === category}
          // Clicking the active chip clears it, so the filter is a toggle
          // rather than something you can only escape via the "All" button.
          onClick={() => onChange(active === category ? '' : category)}
        >
          {category}
          <span className="chip-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
