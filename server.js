import express from 'express'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Dynamic import of local ESM data files
const { default: shops } = await import('./src/data/shops.js')
const { houstonMarketPricing, benchmarks } = await import('./src/data/benchmarks.js')

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

// ── Compact shop summary for system prompt ─────────────────────────────────────
const SHOP_SUMMARY = shops.map(s => ({
  id:       s.id,
  name:     s.name,
  city:     s.city,
  areas:    s.areas ?? [],
  services: s.services,
  tags:     s.tags ?? [],
  rating:   s.rating,
  reviews:  s.reviews,
  pricing:  s.pricing ?? null,
  priceType: s.priceType,
  priceFrom: s.priceFrom ?? null,
  marketEstimate: s.marketEstimate ?? null,
}))

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Wrapedia Copilot — an expert AI assistant for Houston-area car protection services.

SERVICES YOU KNOW:
- Window Tint (regular dyed, ceramic, carbon)
- PPF (Paint Protection Film / clear bra) — brands: XPEL, STEK, SunTek
- Ceramic Coating / Graphene Coating — brands: Ceramic Pro, Gyeon, Gtechniq, FEYNLAB
- Vinyl Wraps / Color Change Wraps
- Commercial Wraps / Fleet Wraps
- Detailing (interior, exterior, mobile, paint correction)
- Chrome Delete

TEXAS TINT LAW (TTC §547.613):
- Front side windows: must allow ≥25% VLT (20% tint is ILLEGAL on front side windows)
- Rear side windows: any darkness allowed with factory side mirrors
- Rear windshield: any darkness allowed with factory side mirrors
- Windshield: non-reflective tint on top 5 inches only
- Reflectivity: ≤25% on all windows
- Medical exemptions available with physician statement
- Penalty: Class C misdemeanor, up to $500 fine

HOUSTON MARKET PRICING:
- Window Tint: $120–$900 (basic dyed $120–$350 sedan, ceramic $350–$900 sedan)
- PPF full-front: $2,000–$4,500 | full car: $4,500–$9,000 | partial front: $800–$2,000
- Ceramic Coating: 1yr $400–$700 | 3yr $600–$1,200 | 5yr $1,000–$2,500
- Vinyl Wrap full car: $3,000–$6,000 | partial: $500–$2,000
- Commercial wrap full van: $2,500–$6,000 | lettering only: $250–$900
- Detailing full: $250–$400 | interior: $130–$250 | paint correction: $400–$1,200

SHOP DATABASE (${shops.length} Houston-area shops):
${JSON.stringify(SHOP_SUMMARY, null, 0)}

RESPONSE RULES:
1. Be concise — answer field under 150 words
2. Use **bold** for key terms, bullet points for lists
3. For tint law questions: set disclaimer=true and end with "General guidance — confirm with Texas DPS or your installer."
4. For pricing: always call it "market estimate" and give a range
5. For shop recommendations: only include IDs that are actually in the shop list above and match the user's area/service
6. If user asks about a specific area (Sugar Land, Katy, Pearland, Woodlands, Cypress, Houston), include up to 3 relevant shop IDs
7. sourceChips options: "Texas DPS" | "Published shop price" | "Houston market estimate" | "Product knowledge"
8. Include "Published shop price" only if the recommended shops have priceType:"published"
9. Include "Texas DPS" only for tint law / legal questions

ALWAYS respond with valid JSON only — no markdown fences, no other text:
{
  "answer": "markdown formatted answer here",
  "recommendedShopIds": [],
  "sourceChips": [],
  "disclaimer": false
}`

// ── Gemini helper ──────────────────────────────────────────────────────────────
async function callGemini(message) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')

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

  const data  = await res.json()
  const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  if (!raw) throw new Error('Empty Gemini response')

  // Parse JSON — handle edge cases where model wraps in fences
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  const parsed  = JSON.parse(cleaned)

  // Validate shop IDs
  const validIds = new Set(shops.map(s => s.id))
  const safeIds  = (parsed.recommendedShopIds ?? []).filter(id => validIds.has(Number(id))).map(Number)

  return {
    answer:              parsed.answer             ?? 'Sorry, I could not generate an answer.',
    recommendedShopIds:  safeIds,
    sourceChips:         Array.isArray(parsed.sourceChips) ? parsed.sourceChips : [],
    disclaimer:          !!parsed.disclaimer,
  }
}

// ── POST /api/ai-assistant ─────────────────────────────────────────────────────
app.post('/api/ai-assistant', async (req, res) => {
  const { message } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const result = await callGemini(message.trim())
    res.json(result)
  } catch (err) {
    console.error('[AI assistant]', err.message)
    res.status(503).json({ error: err.message })
  }
})

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    gemini: !!process.env.GEMINI_API_KEY,
    shops:  shops.length,
  })
})

app.listen(PORT, () => {
  const hasKey = !!process.env.GEMINI_API_KEY
  console.log(`\n🚗 Wrapedia API server running on http://localhost:${PORT}`)
  console.log(`   Gemini key: ${hasKey ? '✓ set' : '✗ missing — set GEMINI_API_KEY in .env'}`)
  console.log(`   Shops loaded: ${shops.length}\n`)
})
