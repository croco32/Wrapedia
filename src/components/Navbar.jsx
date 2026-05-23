import React, { useState } from 'react'

const NAV_LINKS = [
  { label: 'Window Tint',     query: 'window tint' },
  { label: 'Vinyl Wraps',     query: 'vinyl wrap color change' },
  { label: 'PPF',             query: 'paint protection film ppf' },
  { label: 'Ceramic Coating', query: 'ceramic coating' },
  { label: 'Detailing',       query: 'mobile detailing' },
  { label: 'Chrome Delete',   query: 'chrome delete' },
]

export default function Navbar({ onSearch, onHome, activeTab, setActiveTab, onSignIn, onListShop, user, onSignOut }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function handleNav(link) {
    setActiveTab(link.label)
    onSearch(link.query)
  }

  function handleLogo(e) {
    e.preventDefault()
    setActiveTab(null)
    onHome?.()
  }

  return (
    <nav className="wd-nav">
      <div className="wd-nav__inner">
        {/* Logo */}
        <a className="wd-logo" href="#" onClick={handleLogo}>
          <div className="wd-logo__mark">W</div>
          <span className="wd-logo__text">
            <span className="green">Wrap</span><span className="dark">edia</span>
          </span>
        </a>

        {/* Nav links */}
        <div className="wd-nav__links">
          {NAV_LINKS.map(l => (
            <button
              key={l.label}
              className={`wd-nav__link${activeTab === l.label ? ' wd-nav__link--active' : ''}`}
              onClick={() => handleNav(l)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="wd-nav__actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="wd-btn-ghost"
                onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00843d', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                Hi, {user.name.split(' ')[0]}
                <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #e2e2e2', minWidth: 180, zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a8a8' }}>{user.email}</div>
                  </div>
                  <button
                    style={{ width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 13, color: '#525252', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setUserMenuOpen(false) }}
                  >📅 My Bookings <span style={{ fontSize: 11, color: '#a8a8a8' }}>(coming soon)</span></button>
                  <button
                    style={{ width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #f4f4f4' }}
                    onClick={() => { setUserMenuOpen(false); onSignOut?.() }}
                  >Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="wd-btn-ghost" onClick={onSignIn}>Sign in</button>
          )}
          <button className="wd-btn-primary" onClick={onListShop}>List your shop</button>
        </div>
      </div>
    </nav>
  )
}
