import React, { useEffect, useRef } from 'react'

// Lazy-load Leaflet to avoid SSR issues
async function loadLeaflet() {
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  return L
}

// Fix Leaflet default marker icon paths broken by bundlers
function fixIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

const CATEGORY_COLORS = {
  tint:     '#3b82f6',
  wrap:     '#a855f7',
  ppf:      '#f59e0b',
  ceramic:  '#00843d',
  detailing:'#ef4444',
  default:  '#6b7280',
}

function markerHtml(color, letter) {
  return `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:${color};border:2px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);color:white;font-weight:800;font-size:11px;">${letter}</span>
  </div>`
}

export default function MapSection({ shops, detectedCategory, onBook, highlightedIds = [] }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)

  useEffect(() => {
    if (!shops?.length || !containerRef.current) return

    let map
    const hlSet = new Set(highlightedIds)

    loadLeaflet().then(L => {
      fixIcons(L)

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const color  = CATEGORY_COLORS[detectedCategory] ?? CATEGORY_COLORS.default
      const bounds = []

      shops.forEach((shop, i) => {
        if (!shop.lat || !shop.lng) return
        bounds.push([shop.lat, shop.lng])

        const isHL      = hlSet.has(shop.id)
        const pinColor  = isHL ? '#f59e0b' : color
        const pinHtml   = isHL
          ? markerHtml(pinColor, String(i + 1)).replace('border:2px solid white', 'border:2px solid white;box-shadow:0 0 0 3px #f59e0b,0 2px 8px rgba(0,0,0,0.35)')
          : markerHtml(pinColor, String(i + 1))

        const icon = L.divIcon({
          html: pinHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        })

        const popup = L.popup({ maxWidth: 260 }).setContent(`
          <div style="font-family:system-ui,sans-serif;padding:4px">
            <div style="font-weight:800;font-size:15px;margin-bottom:4px">${shop.name}</div>
            <div style="font-size:12px;color:#737373;margin-bottom:6px">
              ${'★'.repeat(Math.floor(shop.rating))} ${shop.rating} · ${shop.reviews} reviews
            </div>
            <div style="font-size:12px;color:#525252;margin-bottom:8px">${shop.address ?? shop.city}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
              ${shop.services.slice(0,3).map(sv =>
                `<span style="background:#e6f5ec;color:#006b31;font-size:11px;font-weight:600;padding:2px 7px;border-radius:4px">${sv}</span>`
              ).join('')}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              ${shop.priceFrom
                ? `<span style="font-size:18px;font-weight:900;color:#00843d">$${shop.priceFrom}</span>`
                : `<span style="font-size:13px;color:#a8a8a8">Quote only</span>`}
              <button onclick="window.__wrapediaBook('${shop.id}')"
                style="background:#00843d;color:white;border:none;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer">
                Book
              </button>
            </div>
          </div>
        `)

        L.marker([shop.lat, shop.lng], { icon }).bindPopup(popup).addTo(map)
      })

      // Expose booking handler to popup buttons
      window.__wrapediaBook = (idStr) => {
        const shop = shops.find(s => s.id === parseInt(idStr))
        if (shop && onBook) onBook(shop)
      }

      if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
      else if (bounds.length === 1) map.setView(bounds[0], 13)
      else map.setView([29.7604, -95.3698], 10)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      delete window.__wrapediaBook
    }
  }, [shops, detectedCategory, highlightedIds])

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <h3 style={s.title}>
          📍 Shops on the Map
          <span style={s.count}>{shops?.length ?? 0} locations</span>
        </h3>
        <p style={s.sub}>Click any pin to see details and book</p>
      </div>
      <div ref={containerRef} style={s.map} />
    </div>
  )
}

const s = {
  wrapper: { background: 'white', borderRadius: 16, border: '1px solid #e2e2e2', overflow: 'hidden', marginBottom: 32 },
  header: { padding: '18px 20px 0' },
  title: { fontSize: 17, fontWeight: 800, color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  count: { fontSize: 12, fontWeight: 600, color: '#a8a8a8', background: '#f4f4f4', borderRadius: 20, padding: '2px 10px' },
  sub: { fontSize: 13, color: '#a8a8a8', marginBottom: 12 },
  map: { height: 380, width: '100%' },
}
