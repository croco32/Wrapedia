import { useState, useCallback } from 'react'
import shops from '../data/shops.js'
import { smartSearch } from './useSearch.js'

const SYSTEM_PROMPT = `You are a Houston car services assistant for Wrapedia. Given a user query and shop list, return the best matching shop IDs and a 1-sentence explanation. Flag Texas tint law queries. Respond ONLY in JSON: { "matchedIds": [], "explanation": "", "lawNote": "" }`

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const search = useCallback(async (query) => {
    setLoading(true)
    setError(null)

    const apiKey = import.meta.env.VITE_GEMINI_KEY

    // Always use smart local search (sections + service detection)
    // If Gemini key is present, enhance the explanation via AI
    if (!apiKey || apiKey === 'your_gemini_key_here') {
      setLoading(false)
      return smartSearch(query)
    }

    const shopSummary = shops.map(s =>
      `ID ${s.id}: ${s.name} — services: ${s.services.join(', ')} — from $${s.priceFrom ?? 'quote'}`
    ).join('\n')

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: `Query: "${query}"\n\nShops:\n${shopSummary}` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
          }),
        }
      )
      if (!res.ok) throw new Error(`Gemini API ${res.status}`)

      const data = await res.json()
      const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const json = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(json)

      // Use smart search sections but override explanation with AI's
      const localResult = smartSearch(query)
      return {
        ...localResult,
        explanation: parsed.explanation || localResult.explanation,
        lawNote: parsed.lawNote || localResult.lawNote,
      }
    } catch (err) {
      console.error('Gemini failed, using smart local search:', err)
      setError(err.message)
      return smartSearch(query)
    } finally {
      setLoading(false)
    }
  }, [])

  return { search, loading, error }
}
