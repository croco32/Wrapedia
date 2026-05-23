import React, { useState, useRef, useEffect } from 'react'
import shops from '../data/shops.js'
import { houstonMarketPricing, benchmarks } from '../data/benchmarks.js'

// ── Price ranges shown in fallback answers ────────────────────────────────────
const PR = {
  tint:     '$120–$900',
  ceramic:  '$400–$2,500',
  ppf:      '$800–$9,000',
  detail:   '$100–$400',
  wrap:     '$1,300–$6,000+',
}

// ── Knowledge base (local fallback) ──────────────────────────────────────────
const KB = [
  {
    patterns: [/tesla.*sugar land|sugar land.*tesla|tesla.*model.*(3|y|s|x)|i have.*tesla|my tesla/i],
    answer: '**For a Tesla Model 3 in Sugar Land — here\'s the recommendation:**\n\n🛡️ **Full-front PPF** — Model 3 bumpers sit low and catch road debris constantly. Full front (bumper + hood + mirrors + headlights) starts around **$2,000** in Houston.\n\n✨ **Ceramic coating on the whole car** — adds gloss, UV protection, and easy washing. For a Model 3: **$700–$1,500** depending on prep.\n\n**Best combo:** Full-front PPF first, then ceramic coating over everything. The shops below have Sugar Land locations and Tesla experience.',
    sources: ['Houston market estimate'],
    searchQuery: 'PPF ceramic coating Tesla Sugar Land',
    shopArea: 'sugar land',
    shopService: 'ppf',
  },
  {
    patterns: [/20\s*%.*legal|legal.*20\s*%|is 20|35.*legal|15.*legal/i],
    answer: '**20% tint is not legal on front side windows in Texas.**\n\nTexas law requires front side windows to allow at least **25% VLT** (visible light transmission). That means 20% is too dark for the front.\n\nRear windows can be any darkness as long as factory side mirrors are installed. The rear windshield also has no VLT limit when mirrors are present.\n\n**To stay legal:** Ask for 25% or lighter on front sides — rear can be as dark as you want.',
    sources: ['Texas DPS'],
    disclaimer: true,
    searchQuery: 'window tint houston',
    shopService: 'tint',
  },
  {
    patterns: [/texas.*tint.*law|tint.*law|legal.*tint|vlt|percent.*tint.*legal|what.*percent.*legal/i],
    answer: '**Texas tint law (TTC §547.613):**\n\n• **Front side windows:** ≥ 25% VLT required\n• **Rear side windows:** Any darkness (with factory mirrors)\n• **Rear windshield:** Any darkness (with factory mirrors)\n• **Windshield:** Non-reflective strip, top 5 inches only\n• **Reflectivity:** ≤ 25% on all windows\n\nMedical exemptions exist with a doctor\'s written statement.',
    sources: ['Texas DPS'],
    disclaimer: true,
    searchQuery: 'window tint houston',
    shopService: 'tint',
  },
  {
    patterns: [/ppf.*vs.*ceramic|ceramic.*vs.*ppf|ppf or ceramic|which.*better.*ppf/i],
    answer: '**PPF vs Ceramic Coating — completely different jobs:**\n\n🛡️ **PPF** — thick film that physically stops rock chips, road rash, scratches. Self-heals. Costs more: full-front from **$2,000**.\n\n✨ **Ceramic Coating** — chemical bond adding gloss, water-beading, UV resistance. Does NOT stop chips. From **$400**.\n\n**Best combo for a new car:** Full-front PPF + ceramic over the whole car.',
    sources: ['Houston market estimate', 'Product knowledge'],
    searchQuery: 'PPF ceramic coating houston',
    shopService: 'ppf',
  },
  {
    patterns: [/ceramic.*vs.*regular.*tint|difference.*ceramic.*tint|why.*ceramic tint|ceramic tint.*worth/i],
    answer: '**Ceramic vs regular tint:**\n\n🌡️ **Ceramic** ($300–$900) — blocks 50–70% more heat, no fading, GPS-friendly. Brands: Llumar CTX, 3M Crystalline.\n\n🎨 **Regular dyed** ($120–$350) — cheapest, fades faster in Houston UV, decent privacy.\n\n**In Houston summers, ceramic is worth the upgrade.**',
    sources: ['Houston market estimate', 'Product knowledge'],
    searchQuery: 'ceramic tint houston',
    shopService: 'tint',
  },
  {
    patterns: [/how much.*tint|tint.*cost|price.*window tint|window tint.*price/i],
    answer: `**Houston window tint pricing:**\n\n• Basic dyed sedan: **$${benchmarks.tint.basic.sedan[0]}–$${benchmarks.tint.basic.sedan[1]}**\n• Carbon mid-range: **$${benchmarks.tint.carbonOrMidRange.sedan[0]}–$${benchmarks.tint.carbonOrMidRange.sedan[1]}**\n• Ceramic tint: **$${benchmarks.tint.ceramic.sedan[0]}–$${benchmarks.tint.ceramic.sedan[1]}**\n• SUVs/trucks add $50–$150\n\nFull price range: **${PR.tint}**`,
    sources: ['Published shop price', 'Houston market estimate'],
    searchQuery: 'window tint houston',
    shopService: 'tint',
  },
  {
    patterns: [/how much.*ppf|ppf.*cost|price.*ppf|fair.*ppf/i],
    answer: `**Houston PPF pricing:**\n\n• Partial front: **$${houstonMarketPricing.ppf.partialFront[0]}–$${houstonMarketPricing.ppf.partialFront[1]}**\n• Full front: **$${houstonMarketPricing.ppf.fullFront[0]}–$${houstonMarketPricing.ppf.fullFront[1]}**\n• Full car: **$${houstonMarketPricing.ppf.fullVehicle[0]}–$${houstonMarketPricing.ppf.fullVehicle[1]}**\n\nFull range: **${PR.ppf}**`,
    sources: ['Houston market estimate'],
    searchQuery: 'PPF houston',
    shopService: 'ppf',
  },
  {
    patterns: [/how much.*ceramic coat|ceramic coat.*cost|price.*ceramic coat/i],
    answer: `**Houston ceramic coating:**\n\n• 1-year entry: **$${houstonMarketPricing.ceramicCoating.oneYear[0]}–$${houstonMarketPricing.ceramicCoating.oneYear[1]}**\n• 3-year mid-grade: **$${houstonMarketPricing.ceramicCoating.threeYear[0]}–$${houstonMarketPricing.ceramicCoating.threeYear[1]}**\n• 5-year premium: **$${houstonMarketPricing.ceramicCoating.fiveYear[0]}–$${houstonMarketPricing.ceramicCoating.fiveYear[1]}**\n\nAlways ask if paint correction is included. Full range: **${PR.ceramic}**`,
    sources: ['Houston market estimate'],
    searchQuery: 'ceramic coating houston',
    shopService: 'ceramic',
  },
  {
    patterns: [/commercial wrap|van wrap|fleet wrap|truck wrap|box truck|wrap.*business/i],
    answer: `**Commercial wrap pricing (Houston):**\n\n• Lettering only: **$${houstonMarketPricing.commercialWraps.letteringOnly[0]}–$${houstonMarketPricing.commercialWraps.letteringOnly[1]}**\n• Partial van: **$${houstonMarketPricing.commercialWraps.partialWrap[0]}–$${houstonMarketPricing.commercialWraps.partialWrap[1]}**\n• Full van: **$${houstonMarketPricing.commercialWraps.fullVehicleWrap[0]}–$${houstonMarketPricing.commercialWraps.fullVehicleWrap[1]}**\n\nFleet discounts for 3+ vehicles.`,
    sources: ['Houston market estimate'],
    searchQuery: 'commercial wrap houston',
    shopService: 'wrap',
  },
  {
    patterns: [/best.*tint.*heat|houston.*heat.*tint|reduce.*heat.*tint|tint.*houston.*summer/i],
    answer: '**Best tint for Houston heat — ceramic wins:**\n\nLook for **60–80%+ IR rejection**: Llumar CTX, 3M Crystalline, FormulaOne Pinnacle, Solar Gard Quantum.\n\n**Pro tip:** Ceramic film on the **windshield** (50–70% VLT) cuts cabin heat more than rear windows — that\'s where most solar heat enters. Quality ceramic can reduce cabin temp by 10–15°F.',
    sources: ['Product knowledge'],
    searchQuery: 'ceramic tint houston heat',
    shopService: 'tint',
  },
  {
    patterns: [/shops.*sugar land|sugar land.*shops|best.*sugar land|tint.*sugar land|ppf.*sugar land/i], area: 'sugar land', areaService: 'tint' },
  { patterns: [/shops.*katy|katy.*shops|best.*katy|tint.*katy|ppf.*katy/i],   area: 'katy',         areaService: 'tint' },
  { patterns: [/shops.*pearland|pearland.*shops|best.*pearland/i],             area: 'pearland',     areaService: 'tint' },
  { patterns: [/shops.*woodlands|woodlands.*shops|best.*woodlands/i],          area: 'the woodlands', areaService: 'ceramic' },
]

// ── Area shop lookup ──────────────────────────────────────────────────────────

function getAreaShops(area, serviceHint) {
  const a       = area.toLowerCase()
  const svcWords = serviceHint ? serviceHint.toLowerCase().split(/[\s,]+/) : []
  let matched    = shops.filter(s =>
    s.city.toLowerCase().includes(a) || s.areas?.some(x => x.toLowerCase().includes(a))
  )
  if (svcWords.length > 0) {
    matched = matched.filter(s =>
      svcWords.some(w => s.services.some(sv => sv.toLowerCase().includes(w)) ||
        (s.specialty ?? '').toLowerCase().includes(w))
    )
  }
  return matched.sort((a, b) => b.rating - a.rating).slice(0, 3)
}

function buildAreaResponse(area, query, serviceHint) {
  const areaLabel = area.charAt(0).toUpperCase() + area.slice(1)
  const matched   = getAreaShops(area, serviceHint ?? query)
  if (matched.length === 0) {
    return {
      text: `I don't have specific shops listed in ${areaLabel} yet. Try searching above for "shops near ${areaLabel}".`,
      sources: [],
      searchQuery: `shops near ${areaLabel}`,
    }
  }
  const serviceWord = query.match(/tint|ppf|ceramic|wrap|detail/i)?.[0] ?? 'protection'
  return {
    text: `**Top ${areaLabel} shops for ${serviceWord}:**`,
    sources: matched.some(s => s.priceType === 'published') ? ['Published shop price'] : ['Houston market estimate'],
    searchQuery: `${serviceWord} near ${areaLabel}`,
    shops: matched,
  }
}

function getLocalResponse(text) {
  for (const entry of KB) {
    if (!entry.patterns.some(p => p.test(text))) continue
    if (entry.area) return buildAreaResponse(entry.area, text, entry.areaService)
    if (entry.answer) {
      const resp = { text: entry.answer, sources: entry.sources ?? [], disclaimer: entry.disclaimer ?? false }
      if (entry.searchQuery)  resp.searchQuery = entry.searchQuery
      if (entry.shopArea)     resp.shops       = getAreaShops(entry.shopArea, entry.shopService)
      if (entry.shopService && !entry.shopArea) resp.showShops = entry.shopService
      return resp
    }
  }
  return null
}

// ── Backend API call ──────────────────────────────────────────────────────────

async function callBackendAI(message) {
  const res = await fetch('/api/ai-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `API ${res.status}`)
  }
  return res.json()
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function MsgText({ text }) {
  return (
    <span>
      {text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
        i % 2 === 1
          ? <strong key={i}>{part}</strong>
          : part.split('\n').map((line, j, arr) => (
              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
            ))
      )}
    </span>
  )
}

// ── Source chip ───────────────────────────────────────────────────────────────

const SOURCE_STYLES = {
  'Texas DPS':              { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Published shop price':   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Houston market estimate':{ bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  'Product knowledge':      { bg: '#f4f4f4', color: '#525252', border: '#e2e2e2' },
}

function SourceChip({ label }) {
  const c = SOURCE_STYLES[label] ?? SOURCE_STYLES['Product knowledge']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}`, letterSpacing: '0.03em' }}>
      {label === 'Texas DPS' && '🏛️ '}
      {label === 'Published shop price' && '✓ '}
      {label === 'Houston market estimate' && '~ '}
      {label}
    </span>
  )
}

// ── Inline shop card ──────────────────────────────────────────────────────────

function InlineShopCard({ shop, onBook }) {
  const price = shop.priceFrom ? `From $${shop.priceFrom.toLocaleString()}` : 'Get quote'
  return (
    <div style={s.shopCard}>
      <div style={{
        ...s.shopCardPhoto,
        backgroundImage: shop.photo ? `url(${shop.photo})` : undefined,
        background: shop.photo ? undefined : 'linear-gradient(135deg,#0a2e1a,#16a34a)',
      }} />
      <div style={s.shopCardBody}>
        <div style={s.shopCardName}>{shop.name}</div>
        <div style={s.shopCardCity}>⭐ {shop.rating} · {shop.city}</div>
        <div style={s.shopCardPrice}>{price}</div>
      </div>
      <button style={s.shopCardBtn} onClick={() => onBook?.(shop)}>Book</button>
    </div>
  )
}

// ── Quick prompts ─────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  'Tesla Model 3 in Sugar Land — PPF or ceramic?',
  'Is 20% tint legal in Texas?',
  'Best tint for Houston heat under $300?',
  'Fair price for full-front PPF?',
  'Commercial wrap for a work van?',
  'Best shops near Katy?',
]

// ── Main component ────────────────────────────────────────────────────────────

export default function WrapediaCopilot({ onSearch, onBook, onHighlight, pendingPrompt, onPendingHandled }) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: 'Hi! I\'m **Wrapedia Copilot**. Ask me about Texas tint laws, PPF vs ceramic, pricing, or the best Houston shops for your car.',
    sources: [],
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [aiMode,  setAiMode]  = useState('backend') // 'backend' | 'local'
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120) }, [open])

  useEffect(() => {
    if (pendingPrompt) {
      setOpen(true)
      onPendingHandled?.()
      setTimeout(() => send(pendingPrompt), 200)
    }
  }, [pendingPrompt])

  async function send(text) {
    const q = text.trim()
    if (!q) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    // 1. Try backend (Gemini via server)
    try {
      const data = await callBackendAI(q)
      setAiMode('backend')

      // Look up recommended shops from the returned IDs
      const recommendedShops = (data.recommendedShopIds ?? [])
        .map(id => shops.find(s => s.id === Number(id)))
        .filter(Boolean)

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer,
        sources: data.sourceChips ?? [],
        disclaimer: data.disclaimer ?? false,
        shops: recommendedShops,
        shopIds: data.recommendedShopIds ?? [],
      }])

      setLoading(false)
      return
    } catch (err) {
      // Backend unavailable or key missing — fall through to local KB
      setAiMode('local')
    }

    // 2. Try local KB
    const local = getLocalResponse(q)
    if (local) {
      await new Promise(r => setTimeout(r, 280))
      setMessages(prev => [...prev, { role: 'ai', ...local }])
      setLoading(false)
      return
    }

    // 3. Generic fallback
    setMessages(prev => [...prev, {
      role: 'ai',
      text: 'Try searching above — **"ceramic tint in Katy under $300"** or **"full front PPF near Sugar Land"**. The search understands natural language and matches real shops.',
      sources: [],
      searchQuery: q,
    }])
    setLoading(false)
  }

  function handleAction(searchQuery) {
    if (onSearch) { onSearch(searchQuery); setOpen(false) }
  }

  function handleHighlight(shopIds) {
    if (onHighlight) onHighlight(shopIds)
    setOpen(false)
  }

  const showQuickPrompts = messages.length <= 1

  return (
    <>
      {/* ── Floating "Ask AI" button ─────────────────────────────── */}
      {!open && (
        <button style={s.fab} onClick={() => setOpen(true)} aria-label="Open Wrapedia Copilot">
          <div style={s.fabPulse} />
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={s.fabLabel}>Ask AI</span>
          <span style={s.fabBadge}>AI</span>
        </button>
      )}

      {/* ── Chat drawer ──────────────────────────────────────────── */}
      {open && (
        <div style={s.drawer}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div style={s.headerTitle}>Wrapedia Copilot</div>
                <div style={s.headerSub}>
                  {aiMode === 'local'
                    ? '⚡ Local AI demo mode'
                    : 'Tint laws · PPF · Ceramic · Pricing · Shops'}
                </div>
              </div>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === 'user' ? s.userRow : s.aiRow}>
                {m.role === 'ai' && <div style={s.aiBadge}>AI</div>}
                <div style={m.role === 'user' ? s.userBubble : s.aiBubble}>
                  <div style={s.bubbleText}><MsgText text={m.text} /></div>

                  {m.sources?.length > 0 && (
                    <div style={s.chips}>
                      {m.sources.map(src => <SourceChip key={src} label={src} />)}
                    </div>
                  )}

                  {m.disclaimer && (
                    <div style={s.disclaimer}>
                      General guidance, not legal advice. Confirm with <strong>Texas DPS</strong> or your installer before purchasing.
                    </div>
                  )}

                  {m.shops?.length > 0 && (
                    <div style={s.shopCards}>
                      {m.shops.map(shop => (
                        <InlineShopCard key={shop.id} shop={shop} onBook={onBook} />
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={s.actions}>
                    {m.searchQuery && (
                      <button style={s.actionBtn} onClick={() => handleAction(m.searchQuery)}>
                        🔍 Search shops
                      </button>
                    )}
                    {m.showShops && (
                      <button style={{ ...s.actionBtn, ...s.actionBtnAlt }}
                        onClick={() => handleAction(`${m.showShops} shops houston`)}>
                        Show matching shops
                      </button>
                    )}
                    {m.shopIds?.length > 0 && (
                      <button style={{ ...s.actionBtn, background: '#f59e0b', color: '#0a0a0a' }}
                        onClick={() => handleHighlight(m.shopIds)}>
                        📍 Highlight on map
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={s.aiRow}>
                <div style={s.aiBadge}>AI</div>
                <div style={s.aiBubble}>
                  <div style={s.thinking}>
                    <span style={s.dot} />
                    <span style={{ ...s.dot, animationDelay: '0.15s' }} />
                    <span style={{ ...s.dot, animationDelay: '0.3s' }} />
                    <span style={{ marginLeft: 8, color: '#737373', fontSize: 13 }}>Thinking…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showQuickPrompts && (
            <div style={s.quickPrompts}>
              {QUICK_PROMPTS.map(q => (
                <button key={q} style={s.quickBtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <form style={s.inputRow} onSubmit={e => { e.preventDefault(); send(input) }}>
            <input
              ref={inputRef}
              style={s.input}
              placeholder="Ask about tint, PPF, pricing, laws…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              style={{ ...s.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }}
              disabled={!input.trim() || loading}
            >→</button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes copilotPulse {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.55); opacity: 0; }
        }
        @keyframes copilotDot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40%          { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}

const s = {
  fab: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 900,
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#00843d', color: 'white',
    border: 'none', borderRadius: 50, cursor: 'pointer',
    padding: '13px 20px 13px 16px',
    boxShadow: '0 4px 24px rgba(0,132,61,0.5)',
    fontFamily: 'inherit',
  },
  fabPulse: {
    position: 'absolute', inset: 0, borderRadius: 50,
    background: 'rgba(0,132,61,0.45)',
    animation: 'copilotPulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
    pointerEvents: 'none',
  },
  fabLabel: { fontSize: 15, fontWeight: 800, letterSpacing: '0.01em', position: 'relative' },
  fabBadge: { fontSize: 9, fontWeight: 800, background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', position: 'relative' },

  drawer: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 900,
    width: 420, maxWidth: 'calc(100vw - 32px)',
    maxHeight: '84vh',
    background: 'white', borderRadius: 20,
    boxShadow: '0 20px 64px rgba(0,0,0,0.22)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', border: '1px solid #e2e2e2',
  },

  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'linear-gradient(135deg,#0a2e1a 0%,#00843d 100%)', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  botAvatar:  { width: 34, height: 34, background: 'rgba(255,255,255,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  headerTitle:{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' },
  headerSub:  { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  closeBtn:   { background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  messages: { flex: 1, overflowY: 'auto', padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 14 },
  aiRow:    { display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '95%' },
  userRow:  { display: 'flex', alignSelf: 'flex-end', maxWidth: '80%' },
  aiBadge:  { flexShrink: 0, marginTop: 3, background: '#00843d', color: 'white', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 5px', letterSpacing: '0.05em' },
  aiBubble: { background: '#f4f4f4', borderRadius: '0 12px 12px 12px', padding: '10px 13px', minWidth: 0, flex: 1 },
  userBubble:{ background: '#00843d', color: 'white', borderRadius: '12px 0 12px 12px', padding: '10px 13px' },
  bubbleText:{ fontSize: 13, lineHeight: 1.65, color: 'inherit' },
  chips:    { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  disclaimer:{ marginTop: 8, padding: '7px 10px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 7, fontSize: 11, color: '#78350f', lineHeight: 1.5 },
  actions:  { display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' },
  actionBtn:{ padding: '6px 11px', fontSize: 11, fontWeight: 700, background: '#00843d', color: 'white', border: 'none', borderRadius: 7, cursor: 'pointer' },
  actionBtnAlt:{ background: '#0a0a0a' },
  thinking: { display: 'flex', alignItems: 'center' },
  dot:      { width: 6, height: 6, background: '#00843d', borderRadius: '50%', margin: '0 2px', animation: 'copilotDot 1.2s infinite ease-in-out', display: 'inline-block' },

  shopCards: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  shopCard:  { display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e2e2', borderRadius: 10, overflow: 'hidden' },
  shopCardPhoto: { width: 60, height: 60, flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center' },
  shopCardBody:  { flex: 1, padding: '8px 10px', minWidth: 0 },
  shopCardName:  { fontSize: 12, fontWeight: 800, color: '#0a0a0a', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  shopCardCity:  { fontSize: 10, color: '#737373', marginBottom: 3 },
  shopCardPrice: { fontSize: 12, fontWeight: 700, color: '#00843d' },
  shopCardBtn:   { flexShrink: 0, margin: '0 10px', padding: '7px 12px', background: '#00843d', color: 'white', fontSize: 11, fontWeight: 700, border: 'none', borderRadius: 7, cursor: 'pointer' },

  quickPrompts: { padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 },
  quickBtn:     { padding: '6px 11px', fontSize: 11, fontWeight: 600, background: '#e6f5ec', color: '#006b31', border: '1px solid #bbf7d0', borderRadius: 16, cursor: 'pointer', whiteSpace: 'nowrap' },

  inputRow: { display: 'flex', gap: 8, padding: '10px 12px 14px', borderTop: '1px solid #f0f0f0', flexShrink: 0 },
  input:    { flex: 1, padding: '10px 13px', fontSize: 13, border: '1.5px solid #e2e2e2', borderRadius: 10, fontFamily: 'inherit', color: '#0a0a0a', outline: 'none' },
  sendBtn:  { width: 40, height: 40, background: '#00843d', color: 'white', fontWeight: 700, fontSize: 18, borderRadius: 10, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
}
