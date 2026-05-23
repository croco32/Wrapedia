import React, { useState } from 'react'

const EXAMPLE_QUERIES = [
  'Ceramic tint under $200, legal in TX',
  'Full PPF for a Tesla Model 3',
  'Vinyl color change wrap near me',
  'Best ceramic coating with warranty',
]

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  function handleChip(q) {
    setValue(q)
    onSearch(q)
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Describe what you need — e.g. ceramic tint legal in TX under $200..."
          aria-label="Search for car protection services"
          autoFocus
        />
        <button
          type="submit"
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div style={styles.chips}>
        {EXAMPLE_QUERIES.map(q => (
          <button
            key={q}
            style={styles.chip}
            onClick={() => handleChip(q)}
            type="button"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: 720,
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    gap: 8,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    fontSize: 16,
    border: '2px solid #e5e5e5',
    borderRadius: 10,
    background: '#fff',
    color: '#0a0a0a',
    transition: 'border-color 0.15s',
    minWidth: 0,
  },
  btn: {
    padding: '14px 28px',
    background: '#0a0a0a',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 10,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
    flexShrink: 0,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    padding: '6px 14px',
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 20,
    fontSize: 13,
    color: '#525252',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },
}
