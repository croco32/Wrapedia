import React from 'react'
import shops from '../data/shops.js'

const FEATURED = [
  {
    id: 3,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=260&fit=crop&q=85',
    badge: 'Published Prices',
    deal: 'Window Tint from $120',
  },
  {
    id: 7,
    photo: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=480&h=260&fit=crop&q=85',
    badge: 'Mobile Service',
    deal: 'Interior Detail $100',
  },
  {
    id: 22,
    photo: 'https://images.unsplash.com/photo-1597404294360-feeeda04612e?w=480&h=260&fit=crop&q=85',
    badge: 'Ceramic Pro',
    deal: 'Ceramic Coating $700',
  },
  {
    id: 20,
    photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=480&h=260&fit=crop&q=85',
    badge: 'PPF Specialist',
    deal: 'Full Front PPF $3,900',
  },
]

export default function DealsSection({ onBook }) {
  return (
    <div style={{ background: 'white' }}>
      <div className="wd-section">
        <div className="wd-section__header">
          <h2 className="wd-section__title">
            Today's best deals <span className="green">in Houston</span>
          </h2>
          <span className="wd-section__link" onClick={() => onBook && onBook('all')}>
            View all deals →
          </span>
        </div>

        <div className="wd-deals-grid">
          {FEATURED.map(item => {
            const shop = shops.find(s => s.id === item.id)
            if (!shop) return null
            return (
              <div key={shop.id} className="wd-deal-card" onClick={() => onBook && onBook(shop)}>
                <div
                  className="wd-deal-card__img"
                  style={{
                    backgroundImage: `url(${item.photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <span className="wd-deal-card__badge">{item.badge}</span>
                </div>
                <div className="wd-deal-card__body">
                  <div className="wd-deal-card__name">{shop.name}</div>
                  <div className="wd-deal-card__area">📍 {shop.city}</div>
                  <div>
                    <span className="wd-deal-card__stars">{'★'.repeat(Math.floor(shop.rating))}</span>
                    {' '}
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>{shop.rating}</span>
                    {' · '}
                    <span style={{ fontSize: 13, color: '#737373' }}>{item.deal}</span>
                  </div>
                  <div className="wd-deal-card__meta">
                    <div>
                      <div className="wd-deal-card__price">
                        {shop.priceFrom ? `$${shop.priceFrom}` : 'Quote'}
                      </div>
                      <div className="wd-deal-card__price-label">starting price</div>
                    </div>
                    <button className="wd-deal-card__btn">
                      {shop.priceType === 'quote_required' ? 'Get Quote' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
