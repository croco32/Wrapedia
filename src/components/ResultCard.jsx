import React, { useState } from 'react'
import { getPriceRange } from '../data/benchmarks.js'
import { getServicePrice, getPrimaryCategory, getEstimateRange } from '../hooks/useSearch.js'

const SERVICE_ICONS = {
  'Window Tint': '🪟', 'Ceramic Tint': '🪟', 'Windshield Tint': '🪟',
  'Vinyl Wrap': '🎨', 'Color Change': '🎨', 'Chrome Delete': '⚫', 'Commercial Wraps': '🚐',
  'PPF': '🛡️', 'Full PPF': '🛡️',
  'Ceramic Coating': '✨', 'Graphene Coating': '✨',
  'Detailing': '🚗', 'Mobile Detailing': '🚗', 'Paint Correction': '🔧',
  'Wheel Repair': '⚙️',
}

const PHOTO_BG = [
  'linear-gradient(135deg,#0c2e19,#16a34a)',
  'linear-gradient(135deg,#1a0535,#7c3aed)',
  'linear-gradient(135deg,#0c1f3f,#1d4ed8)',
  'linear-gradient(135deg,#1a1000,#d97706)',
  'linear-gradient(135deg,#1a0010,#be123c)',
  'linear-gradient(135deg,#001a1a,#0f766e)',
  'linear-gradient(135deg,#0a0a0a,#404040)',
  'linear-gradient(135deg,#1a0a00,#c2410c)',
  'linear-gradient(135deg,#001220,#0369a1)',
  'linear-gradient(135deg,#0d0020,#6d28d9)',
]

function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return <span className="wd-result-card__stars">{'★'.repeat(full)}{half ? '½' : ''}</span>
}

const SRC_LABEL = {
  published:     { text: 'Published price', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  quote_required:{ text: 'Quote required',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  estimate:      { text: 'Market estimate', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
}

const CAT_LABEL = { tint: 'Tint', ppf: 'PPF', ceramic: 'Ceramic', wrap: 'Wrap', detailing: 'Detail' }

function SourceLabel({ type }) {
  const l = SRC_LABEL[type] ?? SRC_LABEL.estimate
  return (
    <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: l.bg, color: l.color, border: `1px solid ${l.border}`, marginTop: 4, letterSpacing: '0.02em' }}>
      {type === 'published' ? '✓ ' : type === 'quote_required' ? '' : '~ '}{l.text}
    </div>
  )
}

function PriceDisplay({ shop, detectedCategory }) {
  const effectiveCat = detectedCategory ?? getPrimaryCategory(shop)
  const catLabel     = effectiveCat ? CAT_LABEL[effectiveCat] : null

  if (shop.priceType === 'quote_required') {
    const range = getEstimateRange(shop.marketEstimate, effectiveCat)
    if (range) {
      return (
        <div className="wd-result-card__price">
          {catLabel && <div style={{ fontSize: 10, color: '#92400e', marginBottom: 1 }}>{catLabel} estimate</div>}
          <div style={{ fontSize: 15, fontWeight: 800, color: '#b45309' }}>
            ${range[0].toLocaleString()}–${range[1].toLocaleString()}
          </div>
          <SourceLabel type="estimate" />
        </div>
      )
    }
    return (
      <div className="wd-result-card__price">
        <div style={{ fontSize: 18, fontWeight: 800, color: '#00843d' }}>Get Quote</div>
        <SourceLabel type="quote_required" />
      </div>
    )
  }

  const servicePrice = getServicePrice(shop, effectiveCat)

  if (!servicePrice) {
    return (
      <div className="wd-result-card__price">
        <div style={{ fontSize: 15, fontWeight: 800, color: '#525252' }}>Contact</div>
        <div style={{ fontSize: 11, color: '#a8a8a8' }}>for pricing</div>
        <SourceLabel type="published" />
      </div>
    )
  }

  return (
    <div className="wd-result-card__price">
      {catLabel && <div style={{ fontSize: 10, color: '#737373', marginBottom: 1 }}>{catLabel}</div>}
      <div className="wd-result-card__price-from">from</div>
      <div className="wd-result-card__price-value">${servicePrice.toLocaleString()}</div>
      <SourceLabel type="published" />
    </div>
  )
}

export default function ResultCard({ shop, isTop, onBook, index = 0, detectedCategory }) {
  const [expanded, setExpanded] = useState(false)
  const primaryIcon = SERVICE_ICONS[shop.services[0]] ?? '🚗'
  const bg = PHOTO_BG[index % PHOTO_BG.length]
  const hasPhone = !!shop.phone
  const hasAddress = !!(shop.address || shop.addresses)
  const primaryAddress = shop.address || (shop.addresses && shop.addresses[0])

  return (
    <div className={`wd-result-card${isTop ? ' wd-result-card--top' : ''}`}>
      {isTop && <div className="wd-result-card__top-ribbon">Top Pick</div>}

      {/* Photo panel */}
      <div
        className="wd-result-card__photo"
        style={shop.photo
          ? { backgroundImage: `url(${shop.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: bg }
        }
      >
        {isTop && <div style={{ height: 26 }} />}
        {!shop.photo && <span style={{ fontSize: 52 }}>{primaryIcon}</span>}
        {shop.badge && <div className="wd-result-card__photo-badge">{shop.badge}</div>}
      </div>

      {/* Main body */}
      <div className="wd-result-card__body">
        <div className="wd-result-card__name">{shop.name}</div>

        <div className="wd-result-card__meta">
          <Stars rating={shop.rating} />
          <span className="wd-result-card__rating">{shop.rating}</span>
          <span>({shop.reviews.toLocaleString()} reviews)</span>
          {shop.distance !== 'Comes to you' && shop.distance !== 'Mobile' && (
            <><span>·</span><span>📍 {shop.distance}</span></>
          )}
          <span>·</span>
          <span>{shop.city}</span>
        </div>

        {/* Services */}
        <div className="wd-result-card__services">
          {shop.services.map(s => (
            <span key={s} className="wd-result-card__service">{s}</span>
          ))}
        </div>

        {/* Tags */}
        <div className="wd-result-card__tags" style={{ marginTop: 8 }}>
          {shop.tags.map(t => (
            <span key={t} className="wd-result-card__tag">{t}</span>
          ))}
        </div>

        {/* Address + phone (expandable) */}
        <div style={{ marginTop: 10 }}>
          {hasAddress && (
            <div style={{ fontSize: 13, color: '#525252', display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
              <span>📍</span>
              <span>{primaryAddress}</span>
            </div>
          )}
          {hasPhone && (
            <a
              href={`tel:${shop.phone}`}
              style={{ fontSize: 13, color: '#00843d', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}
            >
              <span>📞</span>
              <span>{shop.phone}</span>
            </a>
          )}
          {shop.addresses && shop.addresses.length > 1 && (
            <button
              style={{ marginTop: 6, fontSize: 12, color: '#00843d', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▲ Hide other locations' : `▼ ${shop.addresses.length - 1} more location${shop.addresses.length > 2 ? 's' : ''}`}
            </button>
          )}
          {expanded && shop.addresses?.slice(1).map((addr, i) => (
            <div key={i} style={{ fontSize: 13, color: '#525252', display: 'flex', gap: 6, marginTop: 4 }}>
              <span>📍</span>
              <span>{addr}
                {shop.phones?.[i + 1] && (
                  <a href={`tel:${shop.phones[i + 1]}`} style={{ marginLeft: 8, color: '#00843d', fontWeight: 600 }}>
                    {shop.phones[i + 1]}
                  </a>
                )}
              </span>
            </div>
          ))}
          {/* Service areas */}
          {shop.serviceAreas && (
            <div style={{ fontSize: 12, color: '#a8a8a8', marginTop: 6 }}>
              Also serves: {shop.serviceAreas.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="wd-result-card__sidebar">
        {shop.badge && <span className="wd-result-card__badge">{shop.badge}</span>}

        <PriceDisplay shop={shop} detectedCategory={detectedCategory} />

        <div className="wd-result-card__avail">
          {shop.nextAvail === 'Get Quote'
            ? '📅 Free Quote'
            : `Next: ${shop.nextAvail}`}
        </div>

        <button
          className="wd-result-card__book-btn"
          onClick={() => onBook && onBook(shop)}
        >
          {shop.priceType === 'quote_required' ? 'Get Quote' : 'Book Slot'}
        </button>
      </div>
    </div>
  )
}
