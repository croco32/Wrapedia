import React, { useState } from 'react'

const SERVICE_TABS = [
  { label: 'Window Tint', icon: '🪟', placeholder: 'e.g. ceramic tint legal in TX under $200…' },
  { label: 'Vinyl Wraps', icon: '🎨', placeholder: 'e.g. full color change wrap for a sedan…' },
  { label: 'PPF', icon: '🛡️', placeholder: 'e.g. PPF for Tesla Model 3 front bumper…' },
  { label: 'Ceramic Coating', icon: '✨', placeholder: 'e.g. ceramic coating with 5-year warranty…' },
  { label: 'Detailing', icon: '🚗', placeholder: 'e.g. full interior and exterior detail…' },
]

const SEARCH_CHIPS = [
  'Ceramic tint under $300',
  'Full front PPF near Katy',
  'Same-day tint install',
  'Ceramic coating with warranty',
]

const AI_CHIPS = [
  { label: 'Tesla Model 3 in Sugar Land — PPF or ceramic?', emoji: '🤖' },
  { label: 'Is 20% tint legal in Texas?',                   emoji: '⚖️' },
  { label: 'Best tint for Houston heat?',                   emoji: '☀️' },
  { label: 'PPF vs ceramic coating?',                       emoji: '🛡️' },
]

export default function HeroSearch({ onSearch, loading, onAskAI }) {
  const [activeTab, setActiveTab] = useState(0)
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const q = value.trim()
    if (q) onSearch(q)
  }

  function handleChip(chip) {
    setValue(chip)
    onSearch(chip)
  }

  const tab = SERVICE_TABS[activeTab]

  return (
    <section className="wd-hero">
      <div className="wd-hero__eyebrow">
        ✦ Houston's #1 AI-Powered Car Protection Marketplace
      </div>

      <h1 className="wd-hero__title">
        Find the best shops for<br />
        <em>car wraps &amp; protection</em>
      </h1>

      <p className="wd-hero__sub">
        Houston · Sugar Land · Katy · The Woodlands · Pearland · Galleria
      </p>

      <div className="wd-searchbox">
        <div className="wd-searchbox__tabs">
          {SERVICE_TABS.map((t, i) => (
            <button
              key={t.label}
              className={`wd-searchbox__tab${activeTab === i ? ' wd-searchbox__tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
              type="button"
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="wd-searchbox__body">
          <form onSubmit={handleSubmit}>
            <div className="wd-searchbox__row">
              <div className="wd-searchbox__location">
                📍 Houston, TX
              </div>
              <div className="wd-searchbox__input-wrap">
                <input
                  className="wd-searchbox__input"
                  type="text"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={tab.placeholder}
                  autoFocus
                />
              </div>
              <button
                className="wd-searchbox__btn"
                type="submit"
                disabled={loading || !value.trim()}
              >
                {loading ? 'Searching…' : 'Find Shops'}
              </button>
            </div>
          </form>

          <div className="wd-searchbox__chips">
            <span style={{ fontSize: 12, color: '#a8a8a8', alignSelf: 'center', marginRight: 4 }}>Try:</span>
            {SEARCH_CHIPS.map(c => (
              <button key={c} className="wd-searchbox__chip" onClick={() => handleChip(c)} type="button">
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI demo prompt row */}
      {onAskAI && (
        <div style={aiRow.wrap}>
          <span style={aiRow.label}>Ask AI:</span>
          <div style={aiRow.chips}>
            {AI_CHIPS.map(c => (
              <button key={c.label} style={aiRow.chip} onClick={() => onAskAI(c.label)} type="button">
                <span style={aiRow.chipEmoji}>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="wd-stats">
        <div className="wd-stats__item">
          <div className="wd-stats__num">30</div>
          <div className="wd-stats__label">Houston Shops</div>
        </div>
        <div className="wd-stats__item">
          <div className="wd-stats__num">AI</div>
          <div className="wd-stats__label">Powered Search</div>
        </div>
        <div className="wd-stats__item">
          <div className="wd-stats__num">4.8★</div>
          <div className="wd-stats__label">Avg Rating</div>
        </div>
        <div className="wd-stats__item">
          <div className="wd-stats__num">$89</div>
          <div className="wd-stats__label">Deals From</div>
        </div>
      </div>
    </section>
  )
}

const aiRow = {
  wrap:      { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0 4px', flexWrap: 'wrap' },
  label:     { fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 },
  chips:     { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip:      { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, cursor: 'pointer', transition: 'background 0.12s', fontFamily: 'inherit' },
  chipEmoji: { fontSize: 13 },
}
