import React from 'react'

const AREAS = [
  {
    name: 'Downtown Houston',
    count: '38 shops',
    photo: 'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=480&h=300&fit=crop&q=85',
  },
  {
    name: 'Sugar Land',
    count: '24 shops',
    photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=480&h=300&fit=crop&q=85',
  },
  {
    name: 'Katy',
    count: '19 shops',
    photo: 'https://images.unsplash.com/photo-1560516883-29ae2b7e2614?w=480&h=300&fit=crop&q=85',
  },
  {
    name: 'The Woodlands',
    count: '21 shops',
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=480&h=300&fit=crop&q=85',
  },
  {
    name: 'Pearland',
    count: '15 shops',
    photo: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=480&h=300&fit=crop&q=85',
  },
  {
    name: 'Galleria / Uptown',
    count: '28 shops',
    photo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=300&fit=crop&q=85',
  },
]

export default function AreasSection({ onSearch }) {
  return (
    <div>
      <div className="wd-section">
        <div className="wd-section__header">
          <h2 className="wd-section__title">
            Popular areas <span className="green">near Houston</span>
          </h2>
          <span className="wd-section__link">Explore all areas →</span>
        </div>

        <div className="wd-areas-grid">
          {AREAS.map(a => (
            <div
              key={a.name}
              className="wd-area-card"
              onClick={() => onSearch(`best shops in ${a.name}`)}
            >
              <div
                className="wd-area-card__bg"
                style={{
                  backgroundImage: `url(${a.photo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="wd-area-card__overlay" />
              <div className="wd-area-card__content">
                <div className="wd-area-card__name">{a.name}</div>
                <div className="wd-area-card__count">{a.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
