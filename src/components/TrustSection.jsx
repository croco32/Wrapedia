import React from 'react'

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Matching',
    desc: 'Describe what you need in plain English. Our AI instantly matches you with the best shops for your exact request.',
  },
  {
    icon: '✅',
    title: 'Verified Shops Only',
    desc: 'Every shop on Wrapedia is verified, rated by real customers, and checked for certifications like XPEL, 3M, and Avery.',
  },
  {
    icon: '📅',
    title: 'Instant Booking',
    desc: 'Pick a time slot and confirm in seconds. No phone tags, no waiting — your appointment is locked in right away.',
  },
  {
    icon: '💰',
    title: 'Best Price Guarantee',
    desc: 'We compare prices across 120+ Houston-area shops so you always get the most competitive quote for your project.',
  },
]

export default function TrustSection() {
  return (
    <div style={{ background: 'white' }}>
      <div className="wd-section">
        <div className="wd-section__header">
          <h2 className="wd-section__title">
            Why choose <span className="green">Wrapedia</span>?
          </h2>
        </div>

        <div className="wd-trust-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="wd-trust-card">
              <div className="wd-trust-card__icon">{f.icon}</div>
              <div className="wd-trust-card__title">{f.title}</div>
              <div className="wd-trust-card__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
