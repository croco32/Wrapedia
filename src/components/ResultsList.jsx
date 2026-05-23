import React, { useState } from 'react'
import ResultCard from './ResultCard.jsx'

function Section({ section, onBook, detectedCategory }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? section.shops : section.shops.slice(0, 3)
  const hasMore = section.shops.length > 3

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
          {section.label}
        </h3>
        <span style={{ fontSize: 13, color: '#a8a8a8' }}>
          {section.shops.length} shop{section.shops.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visible.map((shop, i) => (
          <ResultCard
            key={shop.id}
            shop={shop}
            isTop={i === 0 && section.isTopSection}
            onBook={onBook}
            index={i}
            detectedCategory={detectedCategory}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 12, width: '100%', padding: '10px 0',
            background: 'white', border: '1.5px solid #e2e2e2',
            borderRadius: 10, fontSize: 14, fontWeight: 600,
            color: '#00843d', cursor: 'pointer',
          }}
        >
          Show {section.shops.length - 3} more in this section ↓
        </button>
      )}
    </div>
  )
}

export default function ResultsList({ sections, query, onBook, detectedCategory }) {
  if (!sections || sections.length === 0) return null

  const total = sections.reduce((acc, s) => acc + s.shops.length, 0)

  return (
    <div>
      <p style={{ fontSize: 14, color: '#737373', marginBottom: 24, lineHeight: 1.6 }}>
        <strong>{total} shop{total !== 1 ? 's' : ''}</strong> found for <em>"{query}"</em>
        {sections.length > 1 && ` — organized into ${sections.length} sections below`}
      </p>

      {sections.map(section => (
        <Section
          key={section.key}
          section={section}
          onBook={onBook}
          detectedCategory={detectedCategory}
        />
      ))}
    </div>
  )
}
