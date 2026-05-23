import React, { useEffect } from 'react'

export default function ComingSoonModal({ title, message, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="wd-modal-overlay" onClick={onClose}>
      <div className="wd-modal" style={{ maxWidth: 380, textAlign: 'center', padding: '40px 28px' }} onClick={e => e.stopPropagation()}>
        <button className="wd-modal__close" onClick={onClose}>✕</button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 15, color: '#737373', lineHeight: 1.6, marginBottom: 24 }}>
          {message || 'This feature is coming soon. Check back shortly!'}
        </p>
        <button
          onClick={onClose}
          style={{ padding: '12px 32px', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 10, cursor: 'pointer', border: 'none' }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
