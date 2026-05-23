import React, { useState, forwardRef } from 'react'

const SignInSection = forwardRef(function SignInSection({ onSignIn }, ref) {
  const [mode, setMode]         = useState('signin')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  function validate() {
    if (!email.includes('@')) return 'Enter a valid email address.'
    if (password.length < 6)  return 'Password must be at least 6 characters.'
    if (mode === 'signup' && !name.trim()) return 'Enter your full name.'
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    const displayName = mode === 'signup' ? name.trim() : email.split('@')[0]
    const user = { name: displayName, email: email.trim() }

    // Persist to localStorage
    try { localStorage.setItem('wrapedia_user', JSON.stringify(user)) } catch {}

    setDone(true)
    onSignIn?.(user)
  }

  function handleSignOut() {
    try { localStorage.removeItem('wrapedia_user') } catch {}
    setDone(false)
    setName(''); setEmail(''); setPassword('')
    onSignIn?.(null)
  }

  return (
    <section ref={ref} style={s.section}>
      <div style={s.inner}>

        {/* Left */}
        <div style={s.left}>
          <h2 style={s.headline}>
            {mode === 'signup' ? 'Join Wrapedia' : 'Welcome back'}
          </h2>
          <p style={s.sub}>Save your favorite shops, track bookings, and get exclusive deals.</p>
          <div style={s.benefits}>
            {[
              ['📅', 'Track all your bookings in one place'],
              ['❤️', 'Save & compare shops'],
              ['🔔', 'Get alerts for deals near you'],
              ['💬', 'Direct chat with shops'],
            ].map(([icon, text]) => (
              <div key={text} style={s.benefit}>
                <span style={s.benefitIcon}>{icon}</span>
                <span style={s.benefitText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div style={s.card}>
          {done ? (
            <div style={s.success}>
              <div style={s.checkCircle}>✓</div>
              <h3 style={s.successTitle}>
                {mode === 'signup' ? 'Account created!' : 'Signed in!'}
              </h3>
              <p style={s.successSub}>
                {mode === 'signup'
                  ? `Welcome to Wrapedia, ${name.split(' ')[0]}! You're now signed in.`
                  : `Welcome back! Your bookings and saved shops are ready.`}
              </p>
              <button style={s.btn} onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <>
              <div style={s.toggle}>
                <button
                  style={{ ...s.toggleBtn, ...(mode === 'signin' ? s.toggleActive : {}) }}
                  onClick={() => { setMode('signin'); setError('') }}
                >Sign In</button>
                <button
                  style={{ ...s.toggleBtn, ...(mode === 'signup' ? s.toggleActive : {}) }}
                  onClick={() => { setMode('signup'); setError('') }}
                >Create Account</button>
              </div>

              <form onSubmit={handleSubmit} style={s.form}>
                {mode === 'signup' && (
                  <>
                    <label style={s.label}>Full name</label>
                    <input style={s.input} placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                  </>
                )}

                <label style={s.label}>Email address</label>
                <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />

                <label style={s.label}>Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />

                {error && <p style={s.error}>{error}</p>}

                <button type="submit" style={s.btn}>
                  {mode === 'signin' ? 'Sign In →' : 'Create Account →'}
                </button>

                {mode === 'signin' && (
                  <p style={s.forgot}>Forgot password? <span style={s.link}>Reset it</span></p>
                )}
              </form>

              <p style={s.switchText}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <span style={s.link} onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
})

export default SignInSection

const s = {
  section: { background: 'linear-gradient(135deg, #0a1c10 0%, #0d2e18 100%)', padding: '72px 24px' },
  inner:   { maxWidth: 960, margin: '0 auto', display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' },
  left:    { flex: 1, minWidth: 280 },
  headline:{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 10 },
  sub:     { fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 32, lineHeight: 1.6 },
  benefits:{ display: 'flex', flexDirection: 'column', gap: 16 },
  benefit: { display: 'flex', alignItems: 'center', gap: 12 },
  benefitIcon: { width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  benefitText: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  card:    { flex: '0 0 380px', background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' },
  toggle:  { display: 'flex', background: '#f4f4f4', borderRadius: 10, padding: 4, marginBottom: 24 },
  toggleBtn:   { flex: 1, padding: '9px 0', fontSize: 14, fontWeight: 600, color: '#737373', border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
  toggleActive:{ background: 'white', color: '#0a0a0a', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' },
  form:    { display: 'flex', flexDirection: 'column' },
  label:   { fontSize: 12, fontWeight: 700, color: '#262626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  input:   { padding: '12px 14px', fontSize: 15, border: '1.5px solid #e2e2e2', borderRadius: 8, marginBottom: 16, color: '#0a0a0a', background: '#fff', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  error:   { fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 12 },
  btn:     { width: '100%', padding: '14px 0', background: '#00843d', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 10, cursor: 'pointer', border: 'none', marginTop: 4 },
  forgot:  { textAlign: 'center', fontSize: 13, color: '#a8a8a8', marginTop: 12 },
  switchText:  { textAlign: 'center', fontSize: 13, color: '#737373', marginTop: 16 },
  link:    { color: '#00843d', fontWeight: 600, cursor: 'pointer' },
  success: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '12px 0' },
  checkCircle: { width: 60, height: 60, borderRadius: '50%', background: '#e6f5ec', color: '#00843d', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle:{ fontSize: 22, fontWeight: 800, color: '#0a0a0a' },
  successSub:  { fontSize: 14, color: '#737373', lineHeight: 1.6 },
}
