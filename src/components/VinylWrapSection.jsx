import React, { useState } from 'react'
import shops from '../data/shops.js'

const PACKAGES = [
  {
    key: 'mirrors',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=220&fit=crop&q=85',
    label: 'Mirror Wrap',
    subtitle: 'Per side mirror',
    price: 50,
    priceLabel: '$50 / mirror',
    description: 'Color-match or contrast your mirrors. Popular with chrome delete and two-tone builds.',
    features: ['Avery or 3M vinyl', 'Any color or finish', 'Typically 30–60 min', 'Heat-formed for tight fit'],
    tag: 'Entry Level',
    tagColor: '#3b82f6',
    popular: false,
  },
  {
    key: 'partial',
    photo: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=480&h=220&fit=crop&q=85',
    label: 'Partial Wrap',
    subtitle: 'Roof · Hood · Trunk · Pillars',
    price: 1300,
    priceLabel: 'From $1,300',
    description: 'The most popular option. Accent panels that transform the look without a full wrap budget.',
    features: ['Roof · Hood · Trunk · Pillars', 'Chrome delete packages', '3M / Avery Dennison', '2–3 day install'],
    tag: 'Most Popular',
    tagColor: '#00843d',
    popular: true,
  },
  {
    key: 'full',
    photo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=480&h=220&fit=crop&q=85',
    label: 'Full Body Wrap',
    subtitle: 'Complete color change',
    price: 3000,
    priceLabel: 'From $3,000',
    description: 'Total color transformation. Matte, gloss, satin, chrome, or custom printed. Protects OEM paint underneath.',
    features: ['Complete color change', 'Matte · Gloss · Satin · Chrome', 'OEM paint protected', '3–5 day install', 'Removable — paint safe'],
    tag: 'Full Transformation',
    tagColor: '#7c3aed',
    popular: false,
  },
  {
    key: 'commercial',
    photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad98?w=480&h=220&fit=crop&q=85',
    label: 'Commercial Wrap',
    subtitle: 'Fleet · Box trucks · Vans',
    price: 1300,
    priceLabel: 'From $1,300',
    description: 'Turn your vehicle into a rolling billboard. Lettering, partial, or full-coverage fleet branding.',
    features: ['Lettering from $250', 'Partial from $1,300', 'Full vehicle from $3,000', 'Fleet pricing available', 'Design services included'],
    tag: 'Business',
    tagColor: '#06b6d4',
    popular: false,
  },
]

const VINYL_SHOPS = shops.filter(s =>
  s.services.some(sv => /vinyl wrap|color change|chrome delete|commercial wrap/i.test(sv))
)

const FINISHES = [
  {
    label: 'Gloss Black',
    photo: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Matte Grey',
    photo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Satin White',
    photo: 'https://images.unsplash.com/photo-1514316703755-dca7d7d9d882?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Color Shift',
    photo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Chrome Silver',
    photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Matte Red',
    photo: 'https://images.unsplash.com/photo-1548703607-ab00d547fb82?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Brushed Metal',
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Midnight Blue',
    photo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Forest Green',
    photo: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=320&h=200&fit=crop&q=85',
  },
  {
    label: 'Burnt Orange',
    photo: 'https://images.unsplash.com/photo-1518987048-93e29699e79a?w=320&h=200&fit=crop&q=85',
  },
]

// Assign unique photos per shop — rotate through a distinct set
const WRAP_SHOP_PHOTOS = [
  'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1597404294360-feeeda04612e?w=160&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=160&h=100&fit=crop&q=80',
]

export default function VinylWrapSection({ onBook, onSearch }) {
  const [selected, setSelected] = useState(null)

  return (
    <section style={s.section}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.eyebrow}>Vinyl Wraps</div>
            <h2 style={s.title}>Transform your vehicle's look</h2>
            <p style={s.sub}>
              From single mirrors to a full color change — professional vinyl wraps protect your OEM paint while turning heads. Houston's best installers, all in one place.
            </p>
          </div>
          <button style={s.searchBtn} onClick={() => onSearch?.('vinyl wrap')}>
            Find wrap shops →
          </button>
        </div>

        {/* Package cards */}
        <div style={s.packages}>
          {PACKAGES.map(pkg => (
            <div
              key={pkg.key}
              style={{ ...s.pkg, ...(selected === pkg.key ? s.pkgOn : {}), ...(pkg.popular ? s.pkgPopular : {}) }}
              onClick={() => setSelected(selected === pkg.key ? null : pkg.key)}
            >
              {pkg.popular && <div style={s.popularRibbon}>Most Popular</div>}
              <div
                style={{
                  ...s.pkgPhoto,
                  backgroundImage: `url(${pkg.photo})`,
                }}
              />
              <div style={s.pkgBody}>
                <div style={{ ...s.pkgTag, background: pkg.tagColor + '20', color: pkg.tagColor }}>{pkg.tag}</div>
                <div style={s.pkgLabel}>{pkg.label}</div>
                <div style={s.pkgSub}>{pkg.subtitle}</div>
                <div style={s.pkgPrice}>{pkg.priceLabel}</div>
                <p style={s.pkgDesc}>{pkg.description}</p>
                <ul style={s.pkgFeatures}>
                  {pkg.features.map(f => (
                    <li key={f} style={s.pkgFeature}>
                      <span style={{ color: '#00843d', marginRight: 6 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  style={s.pkgBtn}
                  onClick={e => { e.stopPropagation(); onSearch?.(`vinyl wrap ${pkg.label.toLowerCase()}`) }}
                >
                  Find {pkg.label} shops →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Finishes */}
        <div style={s.finishSection}>
          <h3 style={s.finishTitle}>Popular finishes</h3>
          <p style={s.finishSub}>Real cars — real results. Ask your shop for a full swatch book with 100+ options.</p>
          <div style={s.finishes}>
            {FINISHES.map(f => (
              <div key={f.label} style={s.finish}>
                <div
                  style={{
                    ...s.finishPhoto,
                    backgroundImage: `url(${f.photo})`,
                  }}
                />
                <span style={s.finishLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shops doing wraps */}
        {VINYL_SHOPS.length > 0 && (
          <div style={s.shopsSection}>
            <h3 style={s.shopsTitle}>Houston wrap shops ({VINYL_SHOPS.length})</h3>
            <div style={s.shopCards}>
              {VINYL_SHOPS.map((shop, idx) => {
                const wrapPrice = shop.pricing?.vinylWrap ?? shop.pricing?.colorChange
                const photo = WRAP_SHOP_PHOTOS[idx % WRAP_SHOP_PHOTOS.length]
                return (
                  <div key={shop.id} style={s.shopCard}>
                    <div style={{ ...s.shopPhoto, backgroundImage: `url(${photo})` }} />
                    <div style={s.shopBody}>
                      <div style={s.shopName}>{shop.name}</div>
                      <div style={s.shopCity}>{shop.city}</div>
                      <div style={s.shopSvcs}>
                        {shop.services.filter(sv => /wrap|color change|chrome/i.test(sv)).slice(0, 3).map(sv => (
                          <span key={sv} style={s.svcTag}>{sv}</span>
                        ))}
                      </div>
                      {shop.phone && (
                        <a href={`tel:${shop.phone}`} style={s.shopPhone}>📞 {shop.phone}</a>
                      )}
                    </div>
                    <div style={s.shopRight}>
                      {wrapPrice
                        ? <div style={s.shopPrice}>From<br /><strong style={{ fontSize: 16, color: '#00843d' }}>${wrapPrice.toLocaleString()}</strong></div>
                        : <div style={{ ...s.shopPrice, color: '#a8a8a8', fontSize: 12 }}>Get<br />quote</div>
                      }
                      <button style={s.shopBookBtn} onClick={() => onBook?.(shop)}>
                        Book
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Info note */}
        <div style={s.note}>
          <strong>Good to know:</strong> Vinyl wraps are fully removable — they protect your original paint and won't void most factory warranties. Full wraps can last 5–7 years with proper care. Always ask if the shop includes a post-install warranty and what brand film they use (3M, Avery Dennison, and Hexis are top tier).
        </div>
      </div>
    </section>
  )
}

const s = {
  section: { background: 'white', padding: '60px 24px' },
  inner:   { maxWidth: 1200, margin: '0 auto' },

  header:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 36 },
  eyebrow:   { fontSize: 13, fontWeight: 700, color: '#00843d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  title:     { fontSize: 30, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 8 },
  sub:       { fontSize: 15, color: '#737373', lineHeight: 1.65, maxWidth: 560 },
  searchBtn: { padding: '12px 24px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 14, borderRadius: 10, cursor: 'pointer', border: 'none', flexShrink: 0, alignSelf: 'flex-start', marginTop: 8 },

  packages: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 48 },

  pkg:          { background: '#fafafa', borderRadius: 16, border: '2px solid #e2e2e2', cursor: 'pointer', position: 'relative', transition: 'all 0.15s', overflow: 'hidden' },
  pkgOn:        { border: '2px solid #00843d', background: '#f0fdf4', boxShadow: '0 0 0 4px rgba(0,132,61,0.08)' },
  pkgPopular:   { border: '2px solid #00843d' },
  popularRibbon:{ position: 'absolute', top: 0, right: 0, background: '#00843d', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 8, letterSpacing: '0.05em', zIndex: 1 },
  pkgPhoto:     { width: '100%', height: 140, backgroundSize: 'cover', backgroundPosition: 'center' },
  pkgBody:      { padding: '16px 18px 18px' },
  pkgTag:       { display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' },
  pkgLabel:     { fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 2 },
  pkgSub:       { fontSize: 12, color: '#737373', marginBottom: 8 },
  pkgPrice:     { fontSize: 20, fontWeight: 900, color: '#00843d', marginBottom: 10 },
  pkgDesc:      { fontSize: 13, color: '#525252', lineHeight: 1.5, marginBottom: 12 },
  pkgFeatures:  { listStyle: 'none', padding: 0, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 5 },
  pkgFeature:   { fontSize: 12, color: '#525252', display: 'flex', alignItems: 'flex-start' },
  pkgBtn:       { width: '100%', padding: '10px 0', background: '#0a0a0a', color: 'white', fontWeight: 700, fontSize: 13, borderRadius: 8, cursor: 'pointer', border: 'none' },

  finishSection: { background: '#0a0a0a', borderRadius: 20, padding: '32px 28px', marginBottom: 36 },
  finishTitle:   { fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 },
  finishSub:     { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 },
  finishes:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 },
  finish:        { display: 'flex', flexDirection: 'column', gap: 8 },
  finishPhoto:   { width: '100%', aspectRatio: '16/10', borderRadius: 10, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' },
  finishLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, textAlign: 'center' },

  shopsSection: { marginBottom: 28 },
  shopsTitle:   { fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 14 },
  shopCards:    { display: 'flex', flexDirection: 'column', gap: 10 },
  shopCard:     { display: 'flex', alignItems: 'center', background: '#fafafa', border: '1px solid #e2e2e2', borderRadius: 12, overflow: 'hidden' },
  shopPhoto:    { width: 90, height: 80, flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center' },
  shopBody:     { flex: 1, padding: '10px 14px', minWidth: 0 },
  shopName:     { fontSize: 14, fontWeight: 800, color: '#0a0a0a', marginBottom: 1 },
  shopCity:     { fontSize: 11, color: '#737373', marginBottom: 5 },
  shopSvcs:     { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  svcTag:       { fontSize: 10, fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '2px 6px', borderRadius: 4 },
  shopPhone:    { fontSize: 12, color: '#00843d', fontWeight: 600, textDecoration: 'none' },
  shopRight:    { padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  shopPrice:    { fontSize: 11, color: '#737373', textAlign: 'right', lineHeight: 1.4 },
  shopBookBtn:  { padding: '7px 16px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 12, borderRadius: 8, cursor: 'pointer', border: 'none' },

  note: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px', fontSize: 13, color: '#525252', lineHeight: 1.7 },
}
