import React, { useState, useEffect } from 'react'

const ALL_SERVICES = [
  'Window Tint', 'Ceramic Tint', 'PPF', 'Ceramic Coating',
  'Vinyl Wrap', 'Color Change Wrap', 'Chrome Delete', 'Detailing',
  'Paint Correction', 'Graphene Coating', 'Commercial Wraps',
]

function genRef() {
  return 'LST-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function ListShopModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [ref]           = useState(genRef)

  // Step 1 — shop info
  const [shopName,    setShopName]    = useState('')
  const [address,     setAddress]     = useState('')
  const [city,        setCity]        = useState('')
  const [shopPhone,   setShopPhone]   = useState('')
  const [website,     setWebsite]     = useState('')

  // Step 2 — services & pricing
  const [services,    setServices]    = useState([])
  const [priceNotes,  setPriceNotes]  = useState('')

  // Step 3 — owner contact
  const [ownerName,  setOwnerName]  = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')

  const canStep1 = shopName.trim() && address.trim() && city.trim() && shopPhone.trim()
  const canStep2 = services.length > 0
  const canStep3 = ownerName.trim() && ownerEmail.includes('@')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function toggleService(sv) {
    setServices(prev =>
      prev.includes(sv) ? prev.filter(s => s !== sv) : [...prev, sv]
    )
  }

  function Stepper({ current }) {
    return (
      <div style={s.stepper}>
        {[1, 2, 3].map((n, i) => (
          <React.Fragment key={n}>
            <div style={{ ...s.stepDot, background: n <= current ? '#00843d' : '#e2e2e2', color: n <= current ? 'white' : '#a8a8a8' }}>
              {n < current ? '✓' : n}
            </div>
            {i < 2 && <div style={{ ...s.stepLine, background: n < current ? '#00843d' : '#e2e2e2' }} />}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        {/* ── STEP 1: Shop info ──────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <Stepper current={1} />
            <h2 style={s.title}>List your shop on Wrapedia</h2>
            <p style={s.sub}>Join Houston's trusted car protection marketplace. Free to apply — we'll verify and feature your shop within 48 hours.</p>

            <label style={s.label}>Shop name *</label>
            <input style={s.input} placeholder="e.g. Houston Elite Tint & Wrap" value={shopName} onChange={e => setShopName(e.target.value)} autoFocus />

            <label style={s.label}>Street address *</label>
            <input style={s.input} placeholder="1234 Main St, Suite 100" value={address} onChange={e => setAddress(e.target.value)} />

            <div style={s.twoCol}>
              <div>
                <label style={s.label}>City *</label>
                <input style={s.input} placeholder="Houston" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Shop phone *</label>
                <input style={s.input} placeholder="(713) 555-0100" value={shopPhone} onChange={e => setShopPhone(e.target.value)} type="tel" />
              </div>
            </div>

            <label style={s.label}>Website <span style={s.optional}>(optional)</span></label>
            <input style={s.input} placeholder="https://yourshop.com" value={website} onChange={e => setWebsite(e.target.value)} type="url" />

            <button
              style={{ ...s.primaryBtn, opacity: canStep1 ? 1 : 0.4, marginTop: 24 }}
              onClick={() => canStep1 && setStep(2)}
              disabled={!canStep1}
            >
              Next: Services & Pricing →
            </button>
          </>
        )}

        {/* ── STEP 2: Services & pricing ─────────────────────────────────── */}
        {step === 2 && (
          <>
            <Stepper current={2} />
            <h2 style={s.title}>Services & pricing</h2>
            <p style={s.sub}>Select every service your shop offers. You can set published prices after your shop is live.</p>

            <label style={s.label}>Services offered * <span style={s.optional}>(select all that apply)</span></label>
            <div style={s.serviceGrid}>
              {ALL_SERVICES.map(sv => (
                <button
                  key={sv}
                  style={{ ...s.svcBtn, ...(services.includes(sv) ? s.svcBtnOn : {}) }}
                  onClick={() => toggleService(sv)}
                >
                  {services.includes(sv) && <span style={{ marginRight: 5 }}>✓</span>}
                  {sv}
                </button>
              ))}
            </div>

            {services.length > 0 && (
              <div style={s.selectedNote}>
                {services.length} service{services.length !== 1 ? 's' : ''} selected: {services.join(', ')}
              </div>
            )}

            <label style={s.label}>Pricing notes <span style={s.optional}>(optional)</span></label>
            <textarea
              style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
              placeholder="e.g. Window tint from $140 · PPF full front from $1,200 · Ceramic coating from $700. We can also share a price sheet."
              value={priceNotes}
              onChange={e => setPriceNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button style={s.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button
                style={{ ...s.primaryBtn, flex: 1, opacity: canStep2 ? 1 : 0.4 }}
                onClick={() => canStep2 && setStep(3)}
                disabled={!canStep2}
              >
                Next: Owner Contact →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Owner contact ──────────────────────────────────────── */}
        {step === 3 && (
          <>
            <Stepper current={3} />
            <h2 style={s.title}>Owner contact</h2>
            <p style={s.sub}>We'll use this to verify your listing. This info is kept private and won't appear on your public page.</p>

            <label style={s.label}>Your full name *</label>
            <input style={s.input} placeholder="Jane Smith" value={ownerName} onChange={e => setOwnerName(e.target.value)} autoFocus />

            <label style={s.label}>Email address *</label>
            <input style={s.input} placeholder="owner@yourshop.com" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} type="email" />

            <label style={s.label}>Your mobile number <span style={s.optional}>(optional)</span></label>
            <input style={s.input} placeholder="(713) 555-0199" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} type="tel" />

            <div style={s.summary}>
              <SummaryRow label="Shop name" value={shopName} />
              <SummaryRow label="Address"   value={`${address}, ${city}`} />
              <SummaryRow label="Phone"     value={shopPhone} />
              <SummaryRow label="Services"  value={`${services.length} selected`} />
            </div>

            <p style={{ fontSize: 12, color: '#a8a8a8', marginTop: 12, lineHeight: 1.5 }}>
              By submitting you agree to our listing terms. We verify every shop before publishing — expect a call or email within 48 hours.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={s.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button
                style={{ ...s.primaryBtn, flex: 1, opacity: canStep3 ? 1 : 0.4 }}
                onClick={() => canStep3 && setStep(4)}
                disabled={!canStep3}
              >
                Submit Application →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 4: Success ────────────────────────────────────────────── */}
        {step === 4 && (
          <div style={s.done}>
            <div style={s.checkCircle}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a' }}>Application submitted!</h2>
            <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6, maxWidth: 340 }}>
              Thanks, <strong>{ownerName.split(' ')[0]}</strong>! We received your listing for <strong>{shopName}</strong>. Expect a verification call or email at <strong>{ownerEmail}</strong> within 48 hours.
            </p>

            <div style={s.refBox}>
              <div style={{ fontSize: 11, color: '#a8a8a8', marginBottom: 2 }}>Application reference</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#00843d', letterSpacing: '0.05em' }}>{ref}</div>
            </div>

            <p style={{ fontSize: 12, color: '#a8a8a8', maxWidth: 320, textAlign: 'center' }}>
              Save this reference number. Our team reviews listings Mon–Fri 9am–5pm CT.
            </p>

            <button style={{ ...s.primaryBtn, width: 'auto', padding: '12px 32px' }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 8, padding: '5px 0', borderBottom: '1px solid #f4f4f4' }}>
      <span style={{ color: '#a8a8a8', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#0a0a0a', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:   { background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' },
  closeBtn:{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#f4f4f4', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  stepper:  { display: 'flex', alignItems: 'center', marginBottom: 20 },
  stepDot:  { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  stepLine: { flex: 1, height: 2, margin: '0 4px' },

  title: { fontSize: 20, fontWeight: 800, color: '#0a0a0a', marginBottom: 8, paddingRight: 20 },
  sub:   { fontSize: 13, color: '#737373', marginBottom: 16, lineHeight: 1.55 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, marginTop: 16 },
  optional: { fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#a8a8a8' },

  twoCol:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input:   { width: '100%', padding: '11px 13px', fontSize: 14, border: '1.5px solid #e2e2e2', borderRadius: 8, color: '#0a0a0a', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' },

  serviceGrid:  { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  svcBtn:       { padding: '8px 14px', fontSize: 13, fontWeight: 500, background: '#f4f4f4', color: '#525252', border: '2px solid transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' },
  svcBtnOn:     { background: '#e6f5ec', color: '#00843d', borderColor: '#00843d', fontWeight: 700 },
  selectedNote: { fontSize: 12, color: '#00843d', background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 4 },

  summary: { background: '#fafafa', borderRadius: 10, padding: '12px 14px', marginTop: 12 },

  primaryBtn: { width: '100%', padding: '14px 0', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 10, cursor: 'pointer', border: 'none' },
  backBtn:    { padding: '14px 18px', fontSize: 14, fontWeight: 600, background: '#f4f4f4', color: '#0a0a0a', borderRadius: 10, cursor: 'pointer', border: 'none', flexShrink: 0 },

  done: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '12px 0' },
  checkCircle: { width: 64, height: 64, borderRadius: '50%', background: '#e6f5ec', color: '#00843d', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  refBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 24px', textAlign: 'center' },
}
