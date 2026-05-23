import React, { useState, useEffect } from 'react'

const DAY   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function genRef() { return 'WRP-' + Math.random().toString(36).slice(2,8).toUpperCase() }

function getThreeSlots() {
  const slots = []
  const now   = new Date()
  const hours = [10, 13, 15]
  let day = 0
  while (slots.length < 3) {
    const d = new Date(now)
    d.setDate(now.getDate() + day)
    if (d.getDay() !== 0) {                          // skip Sunday
      for (const h of hours) {
        if (slots.length >= 3) break
        if (day === 0 && h <= now.getHours()) continue   // skip past hours today
        const label = day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : `${DAY[d.getDay()]} ${d.getDate()}`
        const period = h < 12 ? 'AM' : 'PM'
        const disp   = h > 12 ? h - 12 : h
        slots.push({ label, time: `${disp}:00 ${period}`, date: d })
      }
    }
    day++
    if (day > 14) break
  }
  if (slots.length === 0) {
    slots.push({ label: 'Tomorrow', time: '10:00 AM' }, { label: 'Tomorrow', time: '1:00 PM' }, { label: 'Thu', time: '10:00 AM' })
  }
  return slots
}

function getPriceHint(shop, service) {
  const p  = shop.pricing
  const sl = (service ?? '').toLowerCase()
  if (p) {
    if (/window tint/i.test(sl)  && p.tint)            return `From $${p.tint}`
    if (/ceramic tint/i.test(sl) && p.ceramicTint)     return `From $${p.ceramicTint}`
    if (/ppf/i.test(sl)          && p.ppf)             return `From $${p.ppf}`
    if (/ceramic coat/i.test(sl) && p.ceramicCoating)  return `From $${p.ceramicCoating}`
    if (/graphene/i.test(sl)     && p.grapheneCoating) return `From $${p.grapheneCoating}`
    if (/interior/i.test(sl)     && p.interiorDetail)  return `From $${p.interiorDetail}`
    if (/full detail/i.test(sl)  && p.fullDetail)      return `From $${p.fullDetail}`
    if (/detail/i.test(sl)       && p.detailing)       return `From $${p.detailing}`
    if (/vinyl wrap/i.test(sl)   && p.vinylWrap)       return `From $${p.vinylWrap}`
    if (/color change/i.test(sl) && p.colorChange)     return `From $${p.colorChange}`
    if (/paint correct/i.test(sl)&& p.paintCorrection) return `From $${p.paintCorrection}`
  }
  if (shop.marketEstimate) {
    const first = Object.values(shop.marketEstimate)[0]
    return `Est. $${first[0]}–$${first[1]}`
  }
  return shop.priceFrom ? `From $${shop.priceFrom}` : 'Contact for quote'
}

const SRC = {
  published:     { label: 'Published price', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  quote_required:{ label: 'Quote required',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
}

export default function BookingModal({ shop, onClose }) {
  const isQuote  = shop.priceType === 'quote_required'
  const slots    = getThreeSlots()
  const src      = SRC[shop.priceType] ?? SRC.published

  const [service,  setService]  = useState(shop.services[0])
  const [slot,     setSlot]     = useState(null)
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [carYear,  setCarYear]  = useState('')
  const [carMake,  setCarMake]  = useState('')
  const [carModel, setCarModel] = useState('')
  const [notes,    setNotes]    = useState('')
  const [done,     setDone]     = useState(false)
  const [ref]                   = useState(genRef)

  const price    = getPriceHint(shop, service)
  const vehicle  = [carYear, carMake, carModel].filter(Boolean).join(' ')
  const canBook  = name.trim() && phone.trim() && (isQuote || slot)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (done) {
    return (
      <div style={s.overlay} onClick={onClose}>
        <div style={s.modal} onClick={e => e.stopPropagation()}>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
          <div style={s.done}>
            <div style={s.checkCircle}>{isQuote ? '📤' : '✓'}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a' }}>
              {isQuote ? 'Quote request sent!' : 'Booking confirmed!'}
            </h2>
            <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6, maxWidth: 300, textAlign: 'center' }}>
              {isQuote
                ? `${shop.name} will reach out to ${phone} with pricing for your ${vehicle || service}.`
                : `${shop.name} will call ${phone} to confirm your ${service}${slot ? ` on ${slot.label} at ${slot.time}` : ''}.`}
            </p>
            <div style={s.refBox}>
              <div style={{ fontSize: 11, color: '#a8a8a8', marginBottom: 2 }}>Reference</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#00843d', letterSpacing: '0.05em' }}>{ref}</div>
            </div>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} style={{ fontSize: 13, color: '#00843d', fontWeight: 700 }}>
                📞 {shop.phone}
              </a>
            )}
            <button style={s.confirmBtn} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        {/* Shop header */}
        <div style={s.shopHeader}>
          {shop.photo && <div style={{ ...s.shopPhoto, backgroundImage: `url(${shop.photo})` }} />}
          <div style={s.shopInfo}>
            <div style={s.shopName}>{shop.name}</div>
            <div style={s.shopCity}>📍 {shop.address || shop.city}</div>
            {shop.phone && <a href={`tel:${shop.phone}`} style={s.shopPhone}>📞 {shop.phone}</a>}
          </div>
        </div>

        {/* Service */}
        <label style={s.label}>{isQuote ? 'Service you need' : 'Choose service'}</label>
        <div style={s.serviceGrid}>
          {shop.services.map(sv => (
            <button
              key={sv}
              style={{ ...s.svcBtn, ...(service === sv ? s.svcBtnOn : {}) }}
              onClick={() => setService(sv)}
            >{sv}</button>
          ))}
        </div>

        {/* Price + source label */}
        <div style={s.priceRow}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#00843d' }}>{price}</span>
          <span style={{ ...s.srcBadge, background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
            {shop.priceType === 'published' ? '✓ ' : ''}{src.label}
          </span>
          <span style={{ fontSize: 12, color: '#a8a8a8' }}>· final price by vehicle</span>
        </div>

        {/* Time slots (booking only) */}
        {!isQuote && (
          <>
            <label style={s.label}>Pick a time</label>
            <div style={s.slotRow}>
              {slots.map((sl, i) => (
                <button
                  key={i}
                  style={{ ...s.slotBtn, ...(slot === sl ? s.slotBtnOn : {}) }}
                  onClick={() => setSlot(sl)}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>{sl.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{sl.time}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Your details */}
        <label style={s.label}>Your details</label>
        <div style={s.twoCol}>
          <div>
            <div style={s.inputLabel}>Full name *</div>
            <input style={s.input} placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div style={s.inputLabel}>Phone *</div>
            <input style={s.input} placeholder="(713) 555-0100" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          </div>
        </div>

        {/* Vehicle (for quotes) */}
        {isQuote && (
          <>
            <div style={s.threeCol}>
              <div>
                <div style={s.inputLabel}>Year *</div>
                <input style={s.input} placeholder="2022" value={carYear} onChange={e => setCarYear(e.target.value)} maxLength={4} />
              </div>
              <div>
                <div style={s.inputLabel}>Make *</div>
                <input style={s.input} placeholder="Toyota" value={carMake} onChange={e => setCarMake(e.target.value)} />
              </div>
              <div>
                <div style={s.inputLabel}>Model *</div>
                <input style={s.input} placeholder="Camry" value={carModel} onChange={e => setCarModel(e.target.value)} />
              </div>
            </div>
            <div style={s.inputLabel}>Special notes <span style={{ fontWeight: 400, color: '#a8a8a8' }}>(optional)</span></div>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: 70 }}
              placeholder="Any specific requests — film brand, rush timeline, specific coverage…"
              value={notes} onChange={e => setNotes(e.target.value)}
            />
          </>
        )}

        {/* Confirm */}
        <button
          style={{ ...s.confirmBtn, opacity: canBook ? 1 : 0.4, marginTop: 20 }}
          disabled={!canBook}
          onClick={() => setDone(true)}
        >
          {isQuote ? 'Send Quote Request →' : `Confirm Booking${slot ? ` · ${slot.label} ${slot.time}` : ''} →`}
        </button>

        <p style={{ fontSize: 11, color: '#a8a8a8', textAlign: 'center', marginTop: 8 }}>
          No payment taken now · {shop.name} will call to confirm
        </p>
      </div>
    </div>
  )
}

const s = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:     { background: 'white', borderRadius: 20, padding: '24px 24px 20px', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' },
  closeBtn:  { position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: '#f4f4f4', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  shopHeader:{ display: 'flex', gap: 12, background: '#fafafa', borderRadius: 12, padding: 12, marginBottom: 18, alignItems: 'center' },
  shopPhoto: { width: 52, height: 52, borderRadius: 9, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 },
  shopInfo:  { flex: 1, minWidth: 0 },
  shopName:  { fontSize: 15, fontWeight: 800, color: '#0a0a0a', marginBottom: 2 },
  shopCity:  { fontSize: 12, color: '#737373', marginBottom: 2 },
  shopPhone: { fontSize: 12, color: '#00843d', fontWeight: 600, textDecoration: 'none' },

  label:     { display: 'block', fontSize: 11, fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, marginTop: 16 },
  inputLabel:{ fontSize: 11, fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5, marginTop: 10 },

  serviceGrid:{ display: 'flex', flexWrap: 'wrap', gap: 7 },
  svcBtn:    { padding: '7px 13px', fontSize: 12, fontWeight: 500, background: '#f4f4f4', color: '#525252', border: '2px solid transparent', borderRadius: 8, cursor: 'pointer' },
  svcBtnOn:  { background: '#e6f5ec', color: '#00843d', borderColor: '#00843d', fontWeight: 700 },

  priceRow:  { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10, padding: '10px 12px', background: '#f0fdf4', borderRadius: 9 },
  srcBadge:  { display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.02em' },

  slotRow:   { display: 'flex', gap: 8 },
  slotBtn:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '12px 8px', background: '#fafafa', border: '2px solid #e2e2e2', borderRadius: 10, cursor: 'pointer', color: '#0a0a0a' },
  slotBtnOn: { background: '#00843d', borderColor: '#00843d', color: 'white' },

  twoCol:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  threeCol:  { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  input:     { width: '100%', padding: '10px 12px', fontSize: 14, border: '1.5px solid #e2e2e2', borderRadius: 8, color: '#0a0a0a', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' },

  confirmBtn:{ width: '100%', padding: '14px 0', background: '#00843d', color: 'white', fontWeight: 800, fontSize: 15, borderRadius: 11, cursor: 'pointer', border: 'none' },

  done:      { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '16px 0' },
  checkCircle:{ width: 64, height: 64, borderRadius: '50%', background: '#e6f5ec', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  refBox:    { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 24px', textAlign: 'center' },
}
