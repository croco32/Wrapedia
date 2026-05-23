import React from 'react'

const SERVICE_FILTERS = ['All', 'Window Tint', 'Ceramic Tint', 'Vinyl Wrap', 'PPF', 'Ceramic Coating', 'Detailing']

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Best Match' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'distance',   label: 'Nearest First' },
]

export default function FilterBar({ activeFilter, setActiveFilter, sortBy, setSortBy, resultCount }) {
  return (
    <div className="wd-filter-bar">
      <div className="wd-filter-bar__filters">
        {SERVICE_FILTERS.map(f => (
          <button
            key={f}
            className={`wd-filter-btn${activeFilter === f ? ' wd-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="wd-filter-bar__right">
        <span className="wd-filter-bar__count">{resultCount} shop{resultCount !== 1 ? 's' : ''}</span>
        <select
          className="wd-filter-bar__select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
