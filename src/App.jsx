import React, { useState, useRef, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import HeroSearch from './components/HeroSearch.jsx'
import DealsSection from './components/DealsSection.jsx'
import AreasSection from './components/AreasSection.jsx'
import TrustSection from './components/TrustSection.jsx'
import WrapediaFooter from './components/WrapediaFooter.jsx'
import AIExplainer from './components/AIExplainer.jsx'
import FilterBar from './components/FilterBar.jsx'
import ResultsList from './components/ResultsList.jsx'
import BookingModal from './components/BookingModal.jsx'
import ComingSoonModal from './components/ComingSoonModal.jsx'
import ListShopModal from './components/ListShopModal.jsx'
import WrapediaCopilot from './components/WrapediaCopilot.jsx'
import SignInSection from './components/SignInSection.jsx'
import MapSection from './components/MapSection.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import NearbyShopsSection from './components/NearbyShopsSection.jsx'
import VinylWrapSection from './components/VinylWrapSection.jsx'
import { useGemini } from './hooks/useGemini.js'
import { getServicePrice } from './hooks/useSearch.js'

export default function App() {
  const { search, loading } = useGemini()
  const signInRef = useRef(null)

  // ── Auth state (persisted) ───────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wrapedia_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  function handleSignIn(u) {
    setUser(u)
    if (u) { try { localStorage.setItem('wrapedia_user', JSON.stringify(u)) } catch {} }
    else    { try { localStorage.removeItem('wrapedia_user') } catch {} }
  }

  // ── Search state ─────────────────────────────────────────────────────────
  const [sections,         setSections]         = useState(null)
  const [explanation,      setExplanation]      = useState('')
  const [lawNote,          setLawNote]          = useState('')
  const [lastQuery,        setLastQuery]        = useState('')
  const [detectedCategory, setDetectedCategory] = useState(null)
  const [activeFilter,     setActiveFilter]     = useState('All')
  const [sortBy,           setSortBy]           = useState('relevance')

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState(null)
  const [bookingShop,    setBookingShop]    = useState(null)
  const [comingSoon,     setComingSoon]     = useState(null)
  const [listShopOpen,   setListShopOpen]   = useState(false)
  const [copilotPrompt,  setCopilotPrompt]  = useState(null)
  const [highlightedIds, setHighlightedIds] = useState([])

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleSearch(query) {
    setLastQuery(query)
    setActiveFilter('All')
    setSortBy('relevance')
    const data = await search(query)
    setSections(data.sections)
    setExplanation(data.explanation)
    setLawNote(data.lawNote)
    setDetectedCategory(data.detectedCategory ?? null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setSections(null)
    setLastQuery('')
    setActiveTab(null)
    setDetectedCategory(null)
  }

  function handleAllDeals(shopOrFlag) {
    if (shopOrFlag === 'all') {
      handleSearch('best shops houston')
    } else if (shopOrFlag && typeof shopOrFlag === 'object') {
      setBookingShop(shopOrFlag)
    }
  }

  // ── Filtered + sorted sections ───────────────────────────────────────────
  function getFilteredSections() {
    if (!sections) return null
    if (activeFilter === 'All' && sortBy === 'relevance') return sections

    return sections.map(section => {
      let shopList = [...section.shops]

      if (activeFilter !== 'All') {
        shopList = shopList.filter(s => s.services.includes(activeFilter))
      }

      if (sortBy === 'rating') {
        shopList.sort((a, b) => b.rating - a.rating)
      } else if (sortBy === 'price_asc') {
        shopList.sort((a, b) => {
          const pa = getServicePrice(a, detectedCategory) ?? a.priceFrom ?? 9999
          const pb = getServicePrice(b, detectedCategory) ?? b.priceFrom ?? 9999
          return pa - pb
        })
      } else if (sortBy === 'price_desc') {
        shopList.sort((a, b) => {
          const pa = getServicePrice(a, detectedCategory) ?? a.priceFrom ?? 0
          const pb = getServicePrice(b, detectedCategory) ?? b.priceFrom ?? 0
          return pb - pa
        })
      } else if (sortBy === 'distance') {
        shopList.sort((a, b) => (parseFloat(a.distance) || 999) - (parseFloat(b.distance) || 999))
      }

      return { ...section, shops: shopList }
    }).filter(sec => sec.shops.length > 0)
  }

  const displaySections = getFilteredSections()
  const showResults = !!sections

  const mapShops = displaySections
    ? [...new Map(displaySections.flatMap(s => s.shops).map(s => [s.id, s])).values()]
    : []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f4f4' }}>

      <Navbar
        onSearch={handleSearch}
        onHome={handleBack}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignIn={() => signInRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onListShop={() => setListShopOpen(true)}
        user={user}
        onSignOut={() => handleSignIn(null)}
      />

      {!showResults ? (
        // ── Homepage ────────────────────────────────────────────────────────
        <>
          <HeroSearch onSearch={handleSearch} loading={loading} onAskAI={q => setCopilotPrompt(q)} />
          <DealsSection onBook={handleAllDeals} />
          <AreasSection onSearch={handleSearch} />
          <TrustSection />
          <VinylWrapSection onBook={setBookingShop} onSearch={handleSearch} />
          <NearbyShopsSection onBook={setBookingShop} onSearch={handleSearch} highlightedIds={highlightedIds} />
          <SignInSection ref={signInRef} onSignIn={handleSignIn} />
        </>
      ) : (
        // ── Results ─────────────────────────────────────────────────────────
        <>
          <div className="wd-results-header">
            <div className="wd-results-header__inner">
              <span className="wd-results-header__query">
                {detectedCategory
                  ? `${getCategoryLabel(detectedCategory)} shops near Houston`
                  : `Results for: "${lastQuery}"`}
              </span>
              <button className="wd-results-header__back" onClick={handleBack}>
                ← Back to Home
              </button>
            </div>
          </div>

          {loading && (
            <div className="wd-results-layout">
              <div className="wd-loading">
                <div className="wd-spinner" />
                <span>Finding the best shops for you…</span>
              </div>
            </div>
          )}

          {!loading && displaySections && (
            <div className="wd-results-layout">
              <AIExplainer explanation={explanation} lawNote={lawNote} topShop={displaySections[0]?.shops[0]} />
              <AIAssistant />
              <FilterBar
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resultCount={displaySections.reduce((acc, s) => acc + s.shops.length, 0)}
              />
              {displaySections.length > 0 ? (
                <ResultsList
                  sections={displaySections}
                  query={lastQuery}
                  onBook={setBookingShop}
                  detectedCategory={detectedCategory}
                />
              ) : (
                <NoResults filter={activeFilter} onReset={() => setActiveFilter('All')} />
              )}
              {mapShops.length > 0 && (
                <MapSection shops={mapShops} detectedCategory={detectedCategory} onBook={setBookingShop} highlightedIds={highlightedIds} />
              )}
            </div>
          )}
        </>
      )}

      <WrapediaFooter onSearch={handleSearch} />

      {bookingShop && <BookingModal shop={bookingShop} onClose={() => setBookingShop(null)} />}
      {comingSoon     && <ComingSoonModal title={comingSoon.title} message={comingSoon.message} onClose={() => setComingSoon(null)} />}
      {listShopOpen   && <ListShopModal onClose={() => setListShopOpen(false)} />}

      <WrapediaCopilot
        onSearch={handleSearch}
        onBook={setBookingShop}
        onHighlight={ids => setHighlightedIds(ids)}
        pendingPrompt={copilotPrompt}
        onPendingHandled={() => setCopilotPrompt(null)}
      />
    </div>
  )
}

function getCategoryLabel(cat) {
  return { tint: 'Window Tinting', wrap: 'Vinyl Wrap', ppf: 'PPF', ceramic: 'Ceramic Coating', detailing: 'Detailing' }[cat] ?? cat
}

function NoResults({ filter, onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ fontSize: 16, color: '#737373', marginBottom: 16 }}>
        No shops matched the filter <strong>{filter}</strong> in these results.
      </p>
      <button
        style={{ padding: '10px 24px', background: '#00843d', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 10, cursor: 'pointer', border: 'none' }}
        onClick={onReset}
      >Show all results</button>
    </div>
  )
}
