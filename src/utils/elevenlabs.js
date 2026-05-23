// ElevenLabs voice: Bella (friendly, clear)
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'

// TODO: Add VITE_ELEVENLABS_KEY to your .env file
export async function speakResult(shop, explanation) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_KEY

  if (!apiKey || apiKey === 'your_elevenlabs_key_here') {
    console.warn('WrapFd: ElevenLabs key not set — skipping audio playback.')
    return
  }

  const script = `Your top pick is ${shop.name}, ${shop.distance} away, rated ${shop.rating} stars, starting at $${shop.priceFrom}. ${explanation}`

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (!res.ok) throw new Error(`ElevenLabs API error: ${res.status}`)

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => URL.revokeObjectURL(url)
  } catch (err) {
    console.error('ElevenLabs TTS failed:', err)
  }
}
