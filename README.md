# WrapFd

WrapFd is an AI-powered marketplace for car tinting, vinyl wraps, paint protection film (PPF), and ceramic coating services in Houston, TX. Think "Expedia for car protection" — search in plain English, and AI instantly matches you to the best nearby shops.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your API keys to .env
VITE_GEMINI_KEY=your_gemini_key_here
VITE_ELEVENLABS_KEY=your_elevenlabs_key_here

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How Gemini is used

`src/hooks/useGemini.js` calls the **Gemini 1.5 Flash** model with a system prompt that instructs it to act as a WrapFd car services assistant. It receives the user's natural language query plus a structured list of all 8 Houston shops and returns:

- `matchedIds` — the 1-3 best-fit shop IDs
- `explanation` — a 1-sentence human-readable justification
- `lawNote` — Texas tint law context if the user asked about legality

If the API key is missing or the call fails, a fast local keyword-match fallback runs automatically so the app never breaks.

---

## How ElevenLabs is used

`src/utils/elevenlabs.js` exposes a `speakResult(shop, explanation)` function that:

1. Builds a natural script: *"Your top pick is [name], [distance] away, rated [rating] stars…"*
2. POSTs to the ElevenLabs `/v1/text-to-speech` endpoint using voice **Bella** (ID: `EXAVITQu4vr4xnSDxMaL`) — friendly and clear
3. Plays the returned audio blob in the browser via the Web Audio API

Triggered by the **🔊 Hear results** button in the AI banner. If no key is set, it silently skips.

---

## Demo Script (3-step pitch)

1. **Type** — Enter `"ceramic tint under $200, legal in Texas"` into the search bar  
2. **Match** — Gemini AI picks the best 1-3 shops and explains why, including a Texas tint law note  
3. **Hear** — Click **🔊 Hear results** and ElevenLabs reads the top result aloud in a natural voice

---

## Built for

**HackHCC** — Houston Community College Hackathon
