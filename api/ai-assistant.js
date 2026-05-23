import shops from '../src/data/shops.js'

// ── Compact shop summary for system prompt ─────────────────────────────────────
const SHOP_SUMMARY = shops.map(s => ({
  id:            s.id,
  name:          s.name,
  city:          s.city,
  areas:         s.areas ?? [],
  services:      s.services,
  tags:          s.tags ?? [],
  rating:        s.rating,
  pricing:       s.pricing ?? null,
  priceType:     s.priceType,
  priceFrom:     s.priceFrom ?? null,
  marketEstimate:s.marketEstimate ?? null,
}))

const SYSTEM_PROMPT = `You are Wrapedia Copilot — an expert AI assistant for Houston-area car protection services.

SERVICES: Window Tint (regular/ceramic/carbon), PPF (clear bra — XPEL/STEK/SunTek), Ceramic/Graphene Coating, Vinyl Wraps, Commercial Wraps, Detailing, Paint Correction, Chrome Delete.

TEXAS TINT LAW (TTC §547.613):
- Front side windows: ≥25% VLT required (20% is ILLEGAL on front)
- Rear side windows: any darkness with factory mirrors
- Rear windshield: any darkness with factory mirrors
- Windshield: non-reflective tint top 5 inches only
- Reflectivity: ≤25% all windows | Penalty: Class C misdemeanor, up to $500

HOUSTON MARKET PRICING:
- Tint: $120–$900 (basic sedan $120–$350, ceramic $350–$900)
- PPF: partial front $800–$2,000 | full front $2,000–$4,500 | full car $4,500–$9,000
- Ceramic Coating: 1yr $400–$700 | 3yr $600–$1,200 | 5yr $1,000–$2,500
- Vinyl Wrap full car: $3,000–$6,000 | partial $500–$2,000
- Commercial wrap full van: $2,500–$6,000 | lettering $250–$900
- Detailing full: $250–$400 | interior $130–$250 | paint correction $400–$1,200

SHOP DATABASE (${shops.length} Houston-area shops):
${JSON.stringify(SHOP_SUMMARY)}

RULES:
1. Answer field under 150 words. Use **bold** for key terms, bullets for lists.
2. Tint law questions: set disclaimer=true, end with "General guidance — confirm with Texas DPS or your installer."
3. Pricing: always say "market estimate" and give a range.
4. recommendedShopIds: only when user asks about a specific area, max 3 IDs that exist in the shop list.
5. sourceChips options: "Texas DPS" | "Published shop price" | "Houston market estimate" | "Product knowledge"

ALWAYS respond with valid JSON only — no markdown fences, no other text:
{"answer":"...","recommendedShopIds":[],"sourceChips":[],"disclaimer":false}`

async function callGemini(message) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not configured')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`)
  }

  const data    = await res.json()
  const raw     = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  if (!raw) throw new Error('Empty Gemini response')

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  const parsed  = JSON.parse(cleaned)

  const validIds = new Set(shops.map(s => s.id))
  const safeIds  = (parsed.recommendedShopIds ?? [])
    .filter(id => validIds.has(Number(id)))
    .map(Number)

  return {
    answer:             parsed.answer             ?? 'Sorry, I could not generate an answer.',
    recommendedShopIds: safeIds,
    sourceChips:        Array.isArray(parsed.sourceChips) ? parsed.sourceChips : [],
    disclaimer:         !!parsed.disclaimer,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message } = req.body ?? {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const result = await callGemini(message.trim())
    res.status(200).json(result)
  } catch (err) {
    console.error('[ai-assistant]', err.message)
    res.status(503).json({ error: err.message })
  }
}
