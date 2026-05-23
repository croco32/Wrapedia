import React from 'react'

const SERVICE_LINKS = [
  ['Window Tint', 'window tint'],
  ['Ceramic Tint', 'ceramic tint'],
  ['Vinyl Wraps', 'vinyl wrap color change'],
  ['Color Change Wraps', 'full color change wrap'],
  ['PPF / Clear Bra', 'paint protection film ppf'],
  ['Ceramic Coating', 'ceramic coating'],
  ['Graphene Coating', 'graphene coating'],
  ['Chrome Delete', 'chrome delete'],
  ['Mobile Detailing', 'mobile detailing'],
]

const AREA_LINKS = [
  ['Downtown Houston', 'best shops in downtown houston'],
  ['Sugar Land', 'shops in sugar land'],
  ['Katy', 'shops in katy'],
  ['The Woodlands', 'shops in the woodlands'],
  ['Pearland', 'shops in pearland'],
  ['Missouri City', 'shops near missouri city'],
  ['Galleria / Uptown', 'shops near galleria houston'],
  ['Friendswood', 'shops in friendswood'],
]

export default function WrapediaFooter({ onSearch }) {
  function handleLink(query) {
    if (onSearch) {
      onSearch(query)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="wd-footer">
      <div className="wd-footer__inner">
        <div className="wd-footer__top">

          {/* Brand */}
          <div>
            <div className="wd-footer__brand-logo">
              <div className="wd-footer__brand-mark">W</div>
              <span className="wd-footer__brand-text">Wrapedia</span>
            </div>
            <p className="wd-footer__tagline">
              Houston's #1 marketplace for car wraps, tinting, paint protection film,
              and ceramic coatings. Verified shops, real prices, instant booking.
            </p>
            <div className="wd-footer__socials">
              <div className="wd-footer__social">𝕏</div>
              <div className="wd-footer__social">in</div>
              <div className="wd-footer__social">f</div>
              <div className="wd-footer__social">▶</div>
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="wd-footer__col-title">Services</div>
            <div className="wd-footer__links">
              {SERVICE_LINKS.map(([label, query]) => (
                <span key={label} className="wd-footer__link" onClick={() => handleLink(query)}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div>
            <div className="wd-footer__col-title">Popular Areas</div>
            <div className="wd-footer__links">
              {AREA_LINKS.map(([label, query]) => (
                <span key={label} className="wd-footer__link" onClick={() => handleLink(query)}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="wd-footer__col-title">Company</div>
            <div className="wd-footer__links">
              {['About Wrapedia', 'How It Works', 'Careers', 'Press & Media', 'Blog', 'Partner With Us'].map(c => (
                <span key={c} className="wd-footer__link">{c}</span>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <div className="wd-footer__col-title">Support</div>
            <div className="wd-footer__links">
              {['Help Center', 'Contact Us', 'List Your Shop', 'Business Login', 'Report an Issue', 'Sitemap'].map(s => (
                <span key={s} className="wd-footer__link">{s}</span>
              ))}
            </div>
          </div>

        </div>

        <div className="wd-footer__bottom">
          <span className="wd-footer__copy">© 2025 Wrapedia, Inc. All rights reserved. Houston, TX</span>
          <div className="wd-footer__bottom-links">
            <span className="wd-footer__bottom-link">Privacy Policy</span>
            <span className="wd-footer__bottom-link">Terms of Service</span>
            <span className="wd-footer__bottom-link">Cookie Settings</span>
            <span className="wd-footer__bottom-link">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
