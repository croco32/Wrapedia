import React, { useState } from 'react'
import { speakResult } from '../utils/elevenlabs.js'

const TX_LAW = {
  title: 'Texas Window Tint Law — Official Summary',
  source: 'Texas Transportation Code §547.613 & DPS regulations',
  sections: [
    {
      window: 'Windshield',
      rule: 'Non-reflective tint on the top 5 inches only (AS-1 line or above). No tinting of the rest of the windshield.',
      vlt: 'N/A',
      note: 'Tinted strip above visor is legal. Below that line is illegal.',
    },
    {
      window: 'Front Side Windows (driver + passenger)',
      rule: 'Must allow more than 25% of visible light in (VLT ≥ 25%).',
      vlt: '≥ 25% VLT',
      note: 'Most "limo tint" (5%) on front windows is illegal in Texas.',
    },
    {
      window: 'Rear Side Windows',
      rule: 'Any darkness is allowed IF the vehicle has outside rear-view mirrors on both sides.',
      vlt: 'Any VLT',
      note: 'Standard in most Texas installs — all pickups and SUVs qualify.',
    },
    {
      window: 'Rear Window',
      rule: 'Any darkness allowed with dual side mirrors present.',
      vlt: 'Any VLT',
      note: 'Some installers will not tint the rear window without confirming mirrors.',
    },
  ],
  reflectivity: 'Front and back side windows may not be more than 25% reflective.',
  exemptions: 'Medical exemptions exist — requires a signed physician statement on file in the vehicle.',
  penalty: 'Class C misdemeanor. Fine up to $500 per offense. Officers may require you to remove illegal tint.',
  ceramic: 'Ceramic tint blocks heat without reducing VLT as much as dyed film — a popular legal solution in Texas.',
}

export default function AIExplainer({ explanation, lawNote, topShop }) {
  const [speaking, setSpeaking] = useState(false)
  const [lawOpen,  setLawOpen]  = useState(false)

  async function handleSpeak() {
    if (!topShop) return
    setSpeaking(true)
    await speakResult(topShop, explanation)
    setSpeaking(false)
  }

  if (!explanation) return null

  return (
    <>
      <div className="wd-ai-box">
        <div className="wd-ai-box__main">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="wd-ai-box__text">{explanation}</p>
          </div>
        </div>

        {lawNote && (
          <div className="wd-ai-box__law">
            <span style={{ flexShrink: 0, marginTop: 1 }}>⚖️</span>
            <span style={{ flex: 1 }}>{lawNote}</span>
            <button
              onClick={() => setLawOpen(true)}
              style={{
                flexShrink: 0, background: '#0a2e1a', color: 'white', border: 'none',
                padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.02em',
              }}
            >
              📋 View Full TX Tint Law
            </button>
          </div>
        )}
      </div>

      {/* TX Law Modal */}
      {lawOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLawOpen(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 580, maxHeight: '88vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setLawOpen(false)}
              style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: '#f4f4f4', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >✕</button>

            <div style={{ fontSize: 12, color: '#00843d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>⚖️ Texas Law</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a0a0a', marginBottom: 4 }}>{TX_LAW.title}</h2>
            <p style={{ fontSize: 12, color: '#a8a8a8', marginBottom: 20 }}>Source: {TX_LAW.source}</p>

            {/* Window table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {TX_LAW.sections.map(sec => (
                <div key={sec.window} style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e2e2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a' }}>{sec.window}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: sec.vlt === 'Any VLT' ? '#e6f5ec' : '#fef3c7',
                      color: sec.vlt === 'Any VLT' ? '#00843d' : '#b45309',
                    }}>{sec.vlt}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#525252', marginBottom: 5, lineHeight: 1.5 }}>{sec.rule}</p>
                  <p style={{ fontSize: 12, color: '#a8a8a8', lineHeight: 1.4 }}>💡 {sec.note}</p>
                </div>
              ))}
            </div>

            {/* Additional rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔆', label: 'Reflectivity', text: TX_LAW.reflectivity },
                { icon: '🏥', label: 'Medical Exemption', text: TX_LAW.exemptions },
                { icon: '⚠️', label: 'Penalty', text: TX_LAW.penalty },
                { icon: '🌡️', label: 'Ceramic Tint Tip', text: TX_LAW.ceramic },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#f4f4f4', borderRadius: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#262626', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: '#525252', lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#a8a8a8', marginTop: 20, lineHeight: 1.6 }}>
              This summary is for general informational purposes. Laws may be updated. Always verify with your installer and the Texas DPS. Last checked against Texas Transportation Code §547.613.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
