import React, { useState, useRef, useEffect } from 'react'
import allShops from '../data/shops.js'
import { getServicePrice, getPrimaryCategory, getEstimateRange } from '../hooks/useSearch.js'

const CAT_LABEL = { tint: 'Tint', ppf: 'PPF', ceramic: 'Ceramic', wrap: 'Wrap', detailing: 'Detail' }

// ── Filter definitions ────────────────────────────────────────────────────────

const SERVICE_FILTERS = [
  { key: 'all',        label: 'All Services', icon: '🔍' },
  { key: 'tint',       label: 'Tint',         icon: '🪟', test: s => s.services.some(v => /tint/i.test(v)) },
  { key: 'ppf',        label: 'PPF',          icon: '🛡️', test: s => s.services.some(v => /\bppf\b/i.test(v)) },
  { key: 'ceramic',    label: 'Ceramic',      icon: '✨', test: s => s.services.some(v => /ceramic coating|graphene coating/i.test(v)) },
  { key: 'detailing',  label: 'Detailing',    icon: '🚗', test: s => s.services.some(v => /detail/i.test(v)) },
  { key: 'wraps',      label: 'Wraps',        icon: '🎨', test: s => s.services.some(v => /vinyl wrap|color change|chrome delete/i.test(v)) },
  { key: 'commercial', label: 'Commercial',   icon: '🏢', test: s => s.services.some(v => /commercial/i.test(v)) },
]

const AREA_FILTERS = [
  { key: 'all',         label: 'All Areas' },
  { key: 'houston',     label: 'Houston',     test: s => /houston/i.test(s.city) || s.areas?.some(a => /houston/i.test(a)) },
  { key: 'sugar-land',  label: 'Sugar Land',  test: s => /sugar land/i.test(s.city) || s.areas?.some(a => /sugar land/i.test(a)) },
  { key: 'katy',        label: 'Katy',        test: s => /katy/i.test(s.city) || s.areas?.some(a => /katy/i.test(a)) },
  { key: 'cypress',     label: 'Cypress',     test: s => /cypress/i.test(s.city) || s.areas?.some(a => /cypress/i.test(a)) },
  { key: 'pearland',    label: 'Pearland',    test: s => /pearland/i.test(s.city) || s.areas?.some(a => /pearland/i.test(a)) },
  { key: 'friendswood', label: 'Friendswood', test: s => /friendswood/i.test(s.city) || s.areas?.some(a => /friendswood/i.test(a)) },
]

const CAT_COLORS = {
  ceramic: '#00843d', ppf: '#f59e0b', tint: '#3b82f6',
  detailing: '#ef4444', wraps: '#a855f7', commercial: '#06b6d4', default: '#6b7280',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMarkerColor(shop) {
  const sv = shop.services
  if (sv.some(v => /ceramic coating|graphene/i.test(v))) return CAT_COLORS.ceramic
  if (sv.some(v => /\bppf\b/i.test(v)))                  return CAT_COLORS.ppf
  if (sv.some(v => /commercial/i.test(v)))               return CAT_COLORS.commercial
  if (sv.some(v => /vinyl wrap|color change/i.test(v)))  return CAT_COLORS.wraps
  if (sv.some(v => /tint/i.test(v)))                     return CAT_COLORS.tint
  if (sv.some(v => /detail/i.test(v)))                   return CAT_COLORS.detailing
  return CAT_COLORS.default
}

function getPriceInfo(shop) {
  const cat      = getPrimaryCategory(shop)
  const catLabel = cat ? CAT_LABEL[cat] : null

  if (shop.priceType === 'published') {
    const price = getServicePrice(shop, cat) ?? shop.priceFrom
    if (price) {
      const text = catLabel ? `${catLabel} from $${price.toLocaleString()}` : `From $${price.toLocaleString()}`
      return { type: 'published', text, label: '✓ Published price' }
    }
  }
  if (shop.marketEstimate) {
    const range = getEstimateRange(shop.marketEstimate, cat)
    if (range) {
      const text = catLabel
        ? `${catLabel} est. $${range[0].toLocaleString()}–$${range[1].toLocaleString()}`
        : `Est. $${range[0].toLocaleString()}–$${range[1].toLocaleString()}`
      return { type: 'estimate', text, label: '~ Market estimate' }
    }
    const first = Object.values(shop.marketEstimate)[0]
    if (first) {
      return { type: 'estimate', text: `Est. $${first[0].toLocaleString()}–$${first[1].toLocaleString()}`, label: '~ Market estimate' }
    }
  }
  return { type: 'quote', text: 'Quote required', label: 'ℹ Quote required' }
}

function markerHtml(color, num) {
  return `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${color};border:2.5px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.38);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:white;font-weight:800;font-size:11px;line-height:1;">${num}</span></div>`
}

async function loadLeaflet() {
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  delete L.Icon.Default.prototype._getIconUrl
  return L
}

function filterShops(serviceKey, areaKey) {
  return allShops.filter(shop => {
    if (!shop.lat || !shop.lng) return false
    const svcF  = SERVICE_FILTERS.find(f => f.key === serviceKey)
    const areaF = AREA_FILTERS.find(f => f.key === areaKey)
    if (svcF?.test  && !svcF.test(shop))  return false
    if (areaF?.test && !areaF.test(shop)) return false
    return true
  })
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NearbyShopsSection({ onBook, onSearch, highlightedIds = [] }) {
  const [serviceFilter, setServiceFilter] = useState('all')
  const [areaFilter,    setAreaFilter]    = useState('all')
  const [mapReady,      setMapReady]      = useState(false)

  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const leafletRef   = useRef(null)
  const markersRef   = useRef([])

  const visibleShops = filterShops(serviceFilter, areaFilter)

  // ── Init map (once) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    loadLeaflet().then(L => {
      if (cancelled || mapRef.current) return
      leafletRef.current = L
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)
      map.setView([29.7604, -95.4800], 10)
      setMapReady(true)
    })
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      delete window.__wrapNearby
    }
  }, [])

  // ── Update markers when filters or map ready ─────────────────────────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return
    const L     = leafletRef.current
    const map   = mapRef.current
    const shops = filterShops(serviceFilter, areaFilter)
    const hlSet = new Set(highlightedIds)

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const bounds = []
    shops.forEach((shop, i) => {
      const color    = getMarkerColor(shop)
      const price    = getPriceInfo(shop)
      const priceClr = price.type === 'published' ? '#00843d' : price.type === 'estimate' ? '#d97706' : '#737373'

      const isHL     = hlSet.has(shop.id)
      const markerColor = isHL ? '#f59e0b' : color
      const markerBorder = isHL ? '3px solid white' : '2.5px solid white'
      const hlHtml   = isHL
        ? markerHtml(markerColor, i + 1).replace('border:2.5px solid white', `border:${markerBorder};box-shadow:0 0 0 3px #f59e0b,0 2px 10px rgba(0,0,0,0.38)`)
        : markerHtml(markerColor, i + 1)
      const icon = L.divIcon({
        html: hlHtml,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -36],
      })

      const popup = L.popup({ maxWidth: 272 }).setContent(`
        <div style="font-family:system-ui,sans-serif;padding:4px 2px">
          <div style="font-weight:800;font-size:14px;margin-bottom:2px">${shop.name}</div>
          <div style="font-size:11px;color:#737373;margin-bottom:6px">${shop.city}</div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:7px">
            ${shop.services.slice(0, 3).map(sv =>
              `<span style="background:#e6f5ec;color:#006b31;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">${sv}</span>`
            ).join('')}
          </div>
          <div style="font-size:13px;font-weight:700;color:${priceClr};margin-bottom:1px">${price.text}</div>
          <div style="font-size:10px;color:#a8a8a8;margin-bottom:8px">${price.label}</div>
          ${shop.phone ? `<div style="font-size:11px;color:#525252;margin-bottom:7px">📞 ${shop.phone}</div>` : ''}
          <button onclick="window.__wrapNearby(${shop.id})"
            style="width:100%;background:#00843d;color:white;border:none;padding:8px 0;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;">
            Book / Get Quote
          </button>
        </div>
      `)

      const marker = L.marker([shop.lat, shop.lng], { icon }).bindPopup(popup).addTo(map)
      markersRef.current.push(marker)
      bounds.push([shop.lat, shop.lng])
    })

    window.__wrapNearby = (id) => {
      const shop = allShops.find(s => s.id === id)
      if (shop && onBook) onBook(shop)
    }

    if (bounds.length > 1)      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })
    else if (bounds.length === 1) map.setView(bounds[0], 13)
    else                          map.setView([29.7604, -95.4800], 10)

  }, [mapReady, serviceFilter, areaFilter, onBook, highlightedIds])

  // ── Render ────────────────────────────────────────────────────────────────
  const publishedCount = allShops.filter(s => s.priceType === 'published').length
  const estimateCount  = allShops.filter(s => s.priceType === 'quote_required' && s.marketEstimate).length

  return (
    <section style={s.section}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <h2 style={s.title}>📍 Nearby Houston Shops</h2>
            <p style={s.sub}>
              {allShops.length} Houston-area shops loaded · Published prices where available ·
              Market estimates for quote-only services · Map view for nearby installers
            </p>
          </div>
          <div style={s.legend}>
            <LegendPill color="#00843d" label={`${publishedCount} published`} />
            <LegendPill color="#d97706" label={`${estimateCount} estimates`} />
            <LegendPill color="#737373" label="some quote-only" />
          </div>
        </div>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div style={s.filters}>
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Service:</span>
            <div style={s.chips}>
              {SERVICE_FILTERS.map(f => (
                <button
                  key={f.key}
                  style={{ ...s.chip, ...(serviceFilter === f.key ? s.chipOn : {}) }}
                  onClick={() => setServiceFilter(f.key)}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Area:</span>
            <div style={s.chips}>
              {AREA_FILTERS.map(f => (
                <button
                  key={f.key}
                  style={{ ...s.areaChip, ...(areaFilter === f.key ? s.areaChipOn : {}) }}
                  onClick={() => setAreaFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color key */}
        <div style={s.colorKey}>
          {Object.entries({ Ceramic: '#00843d', PPF: '#f59e0b', Tint: '#3b82f6', Detailing: '#ef4444', Wraps: '#a855f7', Commercial: '#06b6d4' }).map(([label, color]) => (
            <div key={label} style={s.colorItem}>
              <div style={{ ...s.colorDot, background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div ref={containerRef} style={s.map} />

        {/* Result bar */}
        <div style={s.resultBar}>
          <span>
            <strong style={{ color: '#0a0a0a' }}>{visibleShops.length}</strong>
            <span style={{ color: '#737373' }}> shops on map</span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {serviceFilter !== 'all' && <span style={s.tag}>{SERVICE_FILTERS.find(f => f.key === serviceFilter)?.label}</span>}
            {areaFilter    !== 'all' && <span style={s.tag}>{AREA_FILTERS.find(f => f.key === areaFilter)?.label}</span>}
          </div>
          {onSearch && (
            <button style={s.searchBtn} onClick={() => onSearch(
              serviceFilter !== 'all' ? SERVICE_FILTERS.find(f=>f.key===serviceFilter)?.label ?? '' : 'best shops houston'
            )}>
              See full results →
            </button>
          )}
        </div>

        {/* Shop cards */}
        <div style={s.cards}>
          {visibleShops.map((shop, i) => (
            <ShopCard key={shop.id} shop={shop} num={i + 1} onBook={onBook} isHighlighted={highlightedIds.includes(shop.id)} />
          ))}
        </div>

        {/* Disclaimer */}
        <p style={s.disclaimer}>
          Prices shown are from published shop sources or Houston market estimates based on typical ranges.
          Always verify current pricing with the shop directly. <strong>Published price</strong> = sourced from shop website or direct listing. <strong>Market estimate</strong> = typical Houston range for that service.
        </p>
      </div>
    </section>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LegendPill({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#525252' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </div>
  )
}

function ShopCard({ shop, num, onBook, isHighlighted = false }) {
  const price    = getPriceInfo(shop)
  const priceBg  = price.type === 'published' ? '#e6f5ec' : price.type === 'estimate' ? '#fef3c7' : '#f4f4f4'
  const priceClr = price.type === 'published' ? '#00843d' : price.type === 'estimate' ? '#b45309' : '#737373'
  const hlStyle  = isHighlighted ? { border: '2px solid #f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.2)' } : {}

  return (
    <div style={{ ...s.card, ...hlStyle }}>
      {isHighlighted && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: '#f59e0b', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 10, zIndex: 3, letterSpacing: '0.05em' }}>
          AI Match
        </div>
      )}
      {/* Numbered badge */}
      <div style={{ ...s.cardNum, background: getMarkerColor(shop) }}>{num}</div>

      {/* Photo */}
      {shop.photo && (
        <div style={{ ...s.cardPhoto, backgroundImage: `url(${shop.photo})` }} />
      )}

      {/* Body */}
      <div style={s.cardBody}>
        <div style={s.cardName}>{shop.name}</div>
        <div style={s.cardCity}>{shop.city}</div>
        {shop.address && (
          <div style={s.cardAddr}>📍 {shop.address}</div>
        )}
        <div style={s.cardSvcs}>
          {shop.services.slice(0, 4).map(sv => (
            <span key={sv} style={s.svcTag}>{sv}</span>
          ))}
        </div>
        {shop.tags?.length > 0 && (
          <div style={s.cardTags}>
            {shop.tags.slice(0, 2).map(t => (
              <span key={t} style={s.badgeTag}>{t}</span>
            ))}
          </div>
        )}
        {shop.phone && (
          <a href={`tel:${shop.phone}`} style={s.cardPhone}>📞 {shop.phone}</a>
        )}
      </div>

      {/* Price + book */}
      <div style={s.cardRight}>
        <div style={{ ...s.priceBadge, background: priceBg }}>
          <div style={{ ...s.priceVal, color: priceClr }}>{price.text}</div>
          <div style={{ ...s.priceNote, color: priceClr }}>{price.label}</div>
        </div>
        <button style={s.bookBtn} onClick={() => onBook && onBook(shop)}>
          {shop.priceType === 'quote_required' ? 'Get Quote' : 'Book Slot'}
        </button>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  section: { background: '#f4f4f4', padding: '56px 24px 64px' },
  inner:   { maxWidth: 1200, margin: '0 auto' },

  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 },
  headerLeft: { flex: 1, minWidth: 280 },
  title:      { fontSize: 24, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 6 },
  sub:        { fontSize: 14, color: '#737373', lineHeight: 1.6 },
  legend:     { display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 },

  filters:    { background: 'white', borderRadius: 12, border: '1px solid #e2e2e2', padding: '14px 18px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  filterRow:  { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  filterLabel:{ fontSize: 12, fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, width: 52 },
  chips:      { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip:       { padding: '5px 12px', fontSize: 13, fontWeight: 500, color: '#525252', background: '#f4f4f4', borderRadius: 20, border: '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.12s' },
  chipOn:     { background: '#e6f5ec', color: '#00843d', borderColor: '#00843d', fontWeight: 700 },
  areaChip:   { padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#525252', background: '#f4f4f4', borderRadius: 20, border: '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.12s' },
  areaChipOn: { background: '#eff6ff', color: '#1d4ed8', borderColor: '#3b82f6', fontWeight: 700 },

  colorKey:  { display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 10, fontSize: 12, color: '#525252' },
  colorItem: { display: 'flex', alignItems: 'center', gap: 5 },
  colorDot:  { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },

  map: { height: 420, width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e2e2', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },

  resultBar:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '10px 0', marginBottom: 16, fontSize: 14 },
  tag:        { background: '#e6f5ec', color: '#00843d', fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '3px 10px' },
  searchBtn:  { padding: '7px 16px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', border: 'none' },

  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 },

  card:      { background: 'white', borderRadius: 14, border: '1px solid #e2e2e2', display: 'flex', alignItems: 'stretch', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative', transition: 'box-shadow 0.15s' },
  cardNum:   { position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 11, zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  cardPhoto: { width: 96, flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center' },
  cardBody:  { flex: 1, padding: '12px 10px 12px 14px', minWidth: 0 },
  cardName:  { fontSize: 14, fontWeight: 800, color: '#0a0a0a', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardCity:  { fontSize: 11, color: '#737373', marginBottom: 5 },
  cardAddr:  { fontSize: 11, color: '#737373', marginBottom: 6, lineHeight: 1.4 },
  cardSvcs:  { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  svcTag:    { fontSize: 10, fontWeight: 600, color: '#006b31', background: '#e6f5ec', padding: '2px 6px', borderRadius: 4 },
  cardTags:  { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 },
  badgeTag:  { fontSize: 10, color: '#737373', background: '#f4f4f4', padding: '2px 6px', borderRadius: 4 },
  cardPhone: { fontSize: 12, color: '#00843d', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 2 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '12px 12px 12px 8px', flexShrink: 0, gap: 8 },

  priceBadge: { borderRadius: 8, padding: '8px 10px', textAlign: 'right', minWidth: 100 },
  priceVal:   { fontSize: 14, fontWeight: 800, marginBottom: 2 },
  priceNote:  { fontSize: 10, fontWeight: 500 },
  bookBtn:    { padding: '8px 14px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 12, borderRadius: 8, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' },

  disclaimer: { marginTop: 20, fontSize: 12, color: '#a8a8a8', lineHeight: 1.7, borderTop: '1px solid #e2e2e2', paddingTop: 16 },
}
