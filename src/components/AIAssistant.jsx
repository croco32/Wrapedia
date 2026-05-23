import React, { useState, useRef, useEffect } from 'react'
import { benchmarks } from '../data/benchmarks.js'

// Smart local Q&A — answers without needing an API key
const LOCAL_ANSWERS = [
  {
    patterns: [/difference.*ceramic.*regular tint|ceramic vs regular|why ceramic tint/i],
    answer: 'Ceramic tint blocks infrared heat up to 50% better than regular dyed film, stays cooler in Texas summers, and doesn\'t fade or turn purple over time. It costs ~$200–$400 more but most Houston drivers say it\'s worth it.',
  },
  {
    patterns: [/texas.*tint.*law|legal.*tint|vlt|percent.*tint|tint.*legal/i],
    answer: `Texas law: **Front side windows must allow at least 25% VLT** (visible light transmission). Rear windows can be any darkness if factory side mirrors are installed. Windshield: non-reflective tint is allowed on the top 5 inches.`,
  },
  {
    patterns: [/how long.*ppf|ppf.*last|ppf.*warranty/i],
    answer: 'Quality PPF (like XPEL or STEK) lasts **7–10 years** with a manufacturer warranty. It self-heals light scratches with heat and protects against rock chips, road debris, and UV.',
  },
  {
    patterns: [/ceramic coating.*last|how long.*ceramic coat|ceramic.*warranty/i],
    answer: 'Entry-level ceramic coatings last 1–2 years. Mid-grade (Gyeon, Gtechniq) last 3–5 years. Premium coatings with proper prep and application can last **5–10 years**. Always factor in a paint correction step for best results.',
  },
  {
    patterns: [/how much.*tint|tint.*cost|price.*tint|window tint.*price/i],
    answer: `Houston tint pricing:\n• **Basic film (sedan):** $${benchmarks.tint.basic.sedan[0]}–$${benchmarks.tint.basic.sedan[1]}\n• **Carbon/mid-range:** $${benchmarks.tint.carbonOrMidRange.sedan[0]}–$${benchmarks.tint.carbonOrMidRange.sedan[1]}\n• **Ceramic tint:** $${benchmarks.tint.ceramic.sedan[0]}–$${benchmarks.tint.ceramic.sedan[1]}\nSUVs run $50–$100 more.`,
  },
  {
    patterns: [/how much.*ppf|ppf.*cost|price.*ppf/i],
    answer: `Houston PPF pricing:\n• **Partial front (hood/bumper):** $${benchmarks.ppf.partialFront[0]}–$${benchmarks.ppf.partialFront[1]}\n• **Full front:** $${benchmarks.ppf.fullFront[0]}–$${benchmarks.ppf.fullFront[1]}\n• **Full vehicle:** $${benchmarks.ppf.fullVehicle[0]}–$${benchmarks.ppf.fullVehicle[1]}\nPrice varies by vehicle size and film brand.`,
  },
  {
    patterns: [/how much.*ceramic coat|ceramic coat.*cost|price.*ceramic/i],
    answer: `Houston ceramic coating pricing:\n• **1-year entry:** $${benchmarks.ceramicCoating.oneYear[0]}–$${benchmarks.ceramicCoating.oneYear[1]}\n• **3–5 year:** $${benchmarks.ceramicCoating.threeToFiveYear[0]}–$${benchmarks.ceramicCoating.threeToFiveYear[1]}\n• **Paint correction add-on:** $${benchmarks.ceramicCoating.paintCorrectionAddon[0]}–$${benchmarks.ceramicCoating.paintCorrectionAddon[1]}\nAlways get paint correction done first for best bonding.`,
  },
  {
    patterns: [/how much.*detail|detail.*cost|price.*detail/i],
    answer: `Houston detailing pricing:\n• **Basic wash/vacuum:** $${benchmarks.detailing.basicWashVacuum[0]}–$${benchmarks.detailing.basicWashVacuum[1]}\n• **Exterior detail:** $${benchmarks.detailing.exteriorDetail[0]}–$${benchmarks.detailing.exteriorDetail[1]}\n• **Interior deep clean:** $${benchmarks.detailing.interiorDeepClean[0]}–$${benchmarks.detailing.interiorDeepClean[1]}\n• **Full detail:** $${benchmarks.detailing.fullDetail[0]}–$${benchmarks.detailing.fullDetail[1]}`,
  },
  {
    patterns: [/how much.*wrap|vinyl.*cost|price.*wrap/i],
    answer: `Houston vinyl wrap pricing:\n• **Roof or hood wrap:** $${benchmarks.vinylWraps.roofOrHoodWrap[0]}–$${benchmarks.vinylWraps.roofOrHoodWrap[1]}\n• **Partial wrap:** $${benchmarks.vinylWraps.partialWrap[0]}–$${benchmarks.vinylWraps.partialWrap[1]}\n• **Full car wrap:** $${benchmarks.vinylWraps.fullCarWrap[0]}–$${benchmarks.vinylWraps.fullCarWrap[1]}\n• **SUV/truck wrap:** $${benchmarks.vinylWraps.suvOrTruckFullWrap[0]}–$${benchmarks.vinylWraps.suvOrTruckFullWrap[1]}`,
  },
  {
    patterns: [/best shop|recommend|which shop|top shop/i],
    answer: 'Use the search bar above and describe what you need — for example "ceramic tint under $200" or "PPF for Tesla in Katy". Our AI will match you with the best shops for your exact request and budget.',
  },
  {
    patterns: [/mobile.*detail|they come.*me|come to my house/i],
    answer: 'Yes! Several Wrapedia shops offer mobile detailing — they come to your home or office. Search "mobile detailing" and look for the 🚗 Mobile section. CarPlay Mobile Detail and Houston Auto Details are top-rated mobile options.',
  },
  {
    patterns: [/ppf.*vs.*ceramic|difference.*ppf.*ceramic|ceramic.*vs.*ppf/i],
    answer: 'PPF (paint protection film) is a thick clear film that physically blocks chips, scratches, and impacts. Ceramic coating is a chemical bond that repels water, UV, and minor contamination. Many owners do both: PPF on high-impact areas, ceramic on top for easy cleaning.',
  },
  {
    patterns: [/tesla|model 3|model y|model s/i],
    answer: 'For Teslas, Auto Film Specialists and Vive Auto PPF are top choices — both have Tesla/EV experience. Full front PPF for a Model 3 typically runs $1,500–$2,500. Ceramic tint is especially popular for the large glass roof.',
  },
]

const SUGGESTIONS = [
  'What\'s the difference between ceramic and regular tint?',
  'Is 20% tint legal in Texas?',
  'How much does PPF cost?',
  'How long does ceramic coating last?',
  'Which shops do mobile detailing?',
]

function getLocalAnswer(text) {
  for (const qa of LOCAL_ANSWERS) {
    if (qa.patterns.some(p => p.test(text))) return qa.answer
  }
  return null
}

async function getGeminiAnswer(question, apiKey) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: 'You are a helpful assistant for Wrapedia, a Houston car services marketplace. Answer questions about car tinting, PPF, ceramic coating, vinyl wraps, and detailing concisely. Keep answers under 100 words.' }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
      }),
    }
  )
  if (!resp.ok) throw new Error('API error')
  const data = await resp.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

// Render answer with basic **bold** markdown
function AnswerText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i}>{part}</strong>
          : part.split('\n').map((line, j) => (
              <span key={j}>{line}{j < part.split('\n').length - 1 && <br />}</span>
            ))
      )}
    </span>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m the Wrapedia assistant. Ask me anything about car tinting, PPF, ceramic coating, detailing prices, or Texas tint laws.' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(true)
  const bottomRef             = useRef(null)
  const apiKey                = typeof window !== 'undefined' ? import.meta?.env?.VITE_GEMINI_KEY : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const question = text.trim()
    if (!question) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)

    // Try local answer first (instant)
    const local = getLocalAnswer(question)
    if (local) {
      setMessages(prev => [...prev, { role: 'ai', text: local }])
      setLoading(false)
      return
    }

    // Try Gemini if key available
    if (apiKey && apiKey !== 'your_gemini_key_here') {
      try {
        const answer = await getGeminiAnswer(question, apiKey)
        if (answer) {
          setMessages(prev => [...prev, { role: 'ai', text: answer }])
          setLoading(false)
          return
        }
      } catch {}
    }

    // Fallback
    setMessages(prev => [...prev, {
      role: 'ai',
      text: 'Great question! For the most accurate answer, try searching in the bar above — describe what you need and our AI will match you with the right shops. Or call a shop directly using the phone numbers on their cards.',
    }])
    setLoading(false)
  }

  return (
    <div style={s.wrapper}>
      <button style={s.header} onClick={() => setOpen(o => !o)}>
        <div style={s.headerLeft}>
          <div style={s.botIcon}>🤖</div>
          <div>
            <div style={s.headerTitle}>Wrapedia AI Assistant</div>
            <div style={s.headerSub}>Ask about pricing, services, or laws</div>
          </div>
        </div>
        <span style={s.toggle}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.bubble, ...(m.role === 'user' ? s.userBubble : s.aiBubble) }}>
                {m.role === 'ai' && <span style={s.aiTag}>AI</span>}
                <span style={s.bubbleText}><AnswerText text={m.text} /></span>
              </div>
            ))}
            {loading && (
              <div style={{ ...s.bubble, ...s.aiBubble }}>
                <span style={s.aiTag}>AI</span>
                <span style={{ color: '#a8a8a8', fontSize: 14 }}>Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={s.suggestions}>
              {SUGGESTIONS.map(q => (
                <button key={q} style={s.suggestion} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <form style={s.inputRow} onSubmit={e => { e.preventDefault(); send(input) }}>
            <input
              style={s.input}
              placeholder="Ask anything about car services…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" style={s.sendBtn} disabled={!input.trim() || loading}>
              Send →
            </button>
          </form>
        </>
      )}
    </div>
  )
}

const s = {
  wrapper: { background: 'white', borderRadius: 16, border: '1px solid #e2e2e2', overflow: 'hidden', marginBottom: 32 },
  header: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  botIcon: { width: 40, height: 40, background: 'linear-gradient(135deg,#0a2e1a,#16a34a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  headerTitle: { fontSize: 15, fontWeight: 700, color: '#0a0a0a', textAlign: 'left' },
  headerSub: { fontSize: 12, color: '#a8a8a8', textAlign: 'left' },
  toggle: { fontSize: 12, color: '#a8a8a8' },
  messages: { maxHeight: 300, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 },
  bubble: { display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '85%', lineHeight: 1.55 },
  aiBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiTag: { background: '#00843d', color: 'white', fontSize: 10, fontWeight: 800, borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 3, letterSpacing: '0.05em' },
  bubbleText: { fontSize: 14, color: '#262626', background: '#f4f4f4', padding: '10px 14px', borderRadius: 12, lineHeight: 1.6 },
  suggestions: { padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: 8 },
  suggestion: { padding: '6px 12px', background: '#e6f5ec', color: '#006b31', fontSize: 12, fontWeight: 500, borderRadius: 20, cursor: 'pointer', border: 'none', transition: 'background 0.12s' },
  inputRow: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #f0f0f0' },
  input: { flex: 1, padding: '10px 14px', fontSize: 14, border: '1.5px solid #e2e2e2', borderRadius: 8, fontFamily: 'inherit', color: '#0a0a0a' },
  sendBtn: { padding: '10px 18px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 14, borderRadius: 8, cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' },
}
