import shops from '../data/shops.js'
import { benchmarks } from '../data/benchmarks.js'

export const SERVICE_CATEGORIES = {
  tint: {
    keywords: ['tint', 'tinting', 'window film', 'window tint', 'ceramic tint', 'llumar', '3m tint', 'windshield tint'],
    serviceMatch: s => ['Window Tint', 'Ceramic Tint', 'Windshield Tint'].some(v => s.services.includes(v)),
    label: 'Window Tinting',
    lawNote: benchmarks.tint.texasLaw,
    sections: [
      { key: 'topPick', label: '🏆 Top Rated Tint Shops', isTopSection: true,
        filter: s => s.rating >= 4.8, sort: (a,b) => b.rating - a.rating, maxShow: 4 },
      { key: 'bestValue', label: '💰 Best Value — Under $150',
        filter: s => s.pricing?.tint != null && s.pricing.tint < 150,
        sort: (a,b) => (a.pricing?.tint??9999)-(b.pricing?.tint??9999), maxShow: 3 },
      { key: 'sameDay', label: '⚡ Available Today',
        filter: s => s.nextAvail?.toLowerCase().includes('today'),
        sort: (a,b) => b.rating - a.rating, maxShow: 3 },
    ],
  },
  wrap: {
    keywords: ['wrap', 'vinyl', 'color change', 'chrome delete', 'commercial wrap', 'fleet wrap', 'decal', 'lettering'],
    serviceMatch: s => ['Vinyl Wrap', 'Color Change', 'Chrome Delete', 'Commercial Wraps'].some(v => s.services.includes(v)),
    label: 'Vinyl Wraps',
    lawNote: '',
    sections: [
      { key: 'topPick', label: '🎨 Top Wrap Shops', isTopSection: true,
        filter: s => s.rating >= 4.7, sort: (a,b) => b.rating - a.rating, maxShow: 4 },
      { key: 'commercial', label: '🏢 Commercial & Fleet Wraps',
        filter: s => s.services.includes('Commercial Wraps'),
        sort: (a,b) => b.rating - a.rating, maxShow: 3 },
      { key: 'budget', label: '💰 Budget-Friendly Wraps',
        filter: s => s.pricing?.vinylWrap != null && s.pricing.vinylWrap < 700,
        sort: (a,b) => (a.pricing?.vinylWrap??9999)-(b.pricing?.vinylWrap??9999), maxShow: 3 },
    ],
  },
  ppf: {
    keywords: ['ppf', 'paint protection', 'clear bra', 'protection film', 'xpel', 'stek', 'suntek ppf'],
    serviceMatch: s => ['PPF', 'Full PPF', 'Windshield PPF'].some(v => s.services.includes(v)),
    label: 'Paint Protection Film (PPF)',
    lawNote: '',
    sections: [
      { key: 'specialists', label: '🛡️ PPF Specialists', isTopSection: true,
        filter: s => s.tags?.some(t => /xpel|stek|suntek|ppf|feynlab|uppf/i.test(t)),
        sort: (a,b) => b.rating - a.rating, maxShow: 4 },
      { key: 'topRated', label: '⭐ Top Rated for PPF',
        filter: s => s.rating >= 4.8, sort: (a,b) => b.rating - a.rating, maxShow: 3 },
      { key: 'budget', label: '💰 Entry-Level PPF',
        filter: s => s.pricing?.ppf != null && s.pricing.ppf < 1000,
        sort: (a,b) => (a.pricing?.ppf??9999)-(b.pricing?.ppf??9999), maxShow: 3 },
    ],
  },
  ceramic: {
    keywords: ['ceramic', 'coating', 'graphene', 'ceramic coat', 'paint coating', 'gyeon', 'gtechniq', 'feynlab', 'nano coating'],
    serviceMatch: s => ['Ceramic Coating', 'Graphene Coating'].some(v => s.services.includes(v)),
    label: 'Ceramic Coating',
    lawNote: '',
    sections: [
      { key: 'topPick', label: '✨ Top Ceramic Coating Shops', isTopSection: true,
        filter: s => s.rating >= 4.8, sort: (a,b) => b.rating - a.rating, maxShow: 4 },
      { key: 'certified', label: '🏅 Certified Applicators',
        filter: s => s.tags?.some(t => /feynlab|gyeon|gtechniq|ceramic pro|certified/i.test(t)),
        sort: (a,b) => b.rating - a.rating, maxShow: 3 },
      { key: 'budget', label: '💰 Entry-Level Ceramic',
        filter: s => s.pricing?.ceramicCoating != null && s.pricing.ceramicCoating < 700,
        sort: (a,b) => (a.pricing?.ceramicCoating??9999)-(b.pricing?.ceramicCoating??9999), maxShow: 3 },
    ],
  },
  detailing: {
    keywords: ['detail', 'detailing', 'interior', 'exterior', 'full detail', 'wash', 'mobile detail', 'clean', 'polish', 'paint correction'],
    serviceMatch: s => ['Detailing', 'Mobile Detailing', 'Paint Correction'].some(v => s.services.includes(v)),
    label: 'Detailing',
    lawNote: '',
    sections: [
      { key: 'mobile', label: '🚗 Mobile Detailers — They Come to You', isTopSection: true,
        filter: s => s.services.includes('Mobile Detailing'),
        sort: (a,b) => b.rating - a.rating, maxShow: 4 },
      { key: 'topRated', label: '⭐ Top Rated Detailers',
        filter: s => s.rating >= 4.8, sort: (a,b) => b.rating - a.rating, maxShow: 3 },
      { key: 'budget', label: '💰 Budget Detailing — Under $100',
        filter: s => s.pricing?.detailing != null && s.pricing.detailing < 100,
        sort: (a,b) => (a.pricing?.detailing??9999)-(b.pricing?.detailing??9999), maxShow: 3 },
    ],
  },
}

const AREAS = [
  { key: 'katy',       keywords: ['katy', 'west houston', 'cinco ranch', 'energy corridor'] },
  { key: 'sugar land', keywords: ['sugar land', 'sugarland', 'fort bend', 'missouri city'] },
  { key: 'woodlands',  keywords: ['woodlands', 'the woodlands', 'spring', 'tomball', 'conroe'] },
  { key: 'pearland',   keywords: ['pearland', 'friendswood', 'league city', 'webster', 'clear lake'] },
  { key: 'galleria',   keywords: ['galleria', 'uptown', 'westheimer', 'river oaks'] },
  { key: 'houston',    keywords: ['houston', 'midtown', 'heights', 'montrose', 'downtown'] },
]

function detectBudget(q) {
  const m = q.match(/under\s+\$?(\d+)|budget|cheap|affordable|less than \$?(\d+)/i)
  if (!m) return null
  const n = parseInt(m[1] || m[2])
  return isNaN(n) ? 'budget' : n
}

// Returns the right price for a shop given a service category
export function getServicePrice(shop, category) {
  const p = shop.pricing
  if (!p) return null
  if (category === 'tint')     return p.ceramicTint ?? p.tint ?? null
  if (category === 'wrap')     return p.vinylWrap ?? p.colorChange ?? null
  if (category === 'ppf')      return p.ppf ?? null
  if (category === 'ceramic')  return p.ceramicCoating ?? p.grapheneCoating ?? null
  if (category === 'detailing')return p.detailing ?? p.paintCorrection ?? null
  // Lowest available price
  const nums = Object.values(p).filter(v => typeof v === 'number')
  return nums.length ? Math.min(...nums) : null
}

// Determines a shop's primary service category from name + specialty
export function getPrimaryCategory(shop) {
  const text = ((shop.name ?? '') + ' ' + (shop.specialty ?? '')).toLowerCase()
  if (/\bppf\b|paint protection film|clear bra/.test(text)) return 'ppf'
  if (/ceramic coat|graphene coat/.test(text))              return 'ceramic'
  if (/vinyl wrap|color change|wrap shop|chrome delete/.test(text)) return 'wrap'
  if (/\btint\b|window film/.test(text))                    return 'tint'
  if (/\bdetail/.test(text))                                return 'detailing'
  const svcs = (shop.services ?? []).join(' ').toLowerCase()
  if (/\bppf\b|paint protection/.test(svcs)) return 'ppf'
  if (/ceramic coat/.test(svcs))             return 'ceramic'
  if (/vinyl wrap|color change/.test(svcs))  return 'wrap'
  if (/\btint\b/.test(svcs))                 return 'tint'
  if (/detail/.test(svcs))                   return 'detailing'
  return null
}

// Returns a [lo, hi] range from a shop's marketEstimate for a given category
export function getEstimateRange(marketEstimate, category) {
  if (!marketEstimate || !category) return null
  switch (category) {
    case 'ppf':      return marketEstimate.ppfFullCar ?? marketEstimate.ppf ?? marketEstimate.ppfPartialFront ?? null
    case 'ceramic':  return marketEstimate.ceramicCoating ?? null
    case 'tint':     return marketEstimate.ceramicTint ?? marketEstimate.tint ?? null
    case 'wrap':     return marketEstimate.vinylWrap ?? null
    case 'detailing':return marketEstimate.detailing ?? null
    default:         return null
  }
}

export function smartSearch(query) {
  const q = query.toLowerCase()

  // Detect category
  let detectedCategory = null
  for (const [key, cat] of Object.entries(SERVICE_CATEGORIES)) {
    if (cat.keywords.some(kw => q.includes(kw))) { detectedCategory = key; break }
  }

  // Detect area
  let detectedArea = null
  for (const area of AREAS) {
    if (area.keywords.some(kw => q.includes(kw))) { detectedArea = area.key; break }
  }

  const budget = detectBudget(q)

  // Filter pool
  let pool = [...shops]
  if (detectedCategory) {
    pool = pool.filter(SERVICE_CATEGORIES[detectedCategory].serviceMatch)
  } else {
    const words = q.split(/\s+/).filter(w => w.length > 2)
    const scored = shops.map(s => ({
      shop: s,
      score: words.reduce((acc, w) => acc + (s.specialty?.includes(w) ? 1 : 0), 0),
    })).filter(x => x.score > 0).sort((a,b) => b.score - a.score)
    pool = scored.length ? scored.map(x => x.shop) : shops.slice(0, 6)
  }

  if (detectedArea) {
    const af = pool.filter(s =>
      s.areas?.some(a => a.toLowerCase().includes(detectedArea)) ||
      s.city?.toLowerCase().includes(detectedArea) ||
      s.serviceAreas?.some(a => a.toLowerCase().includes(detectedArea))
    )
    if (af.length > 0) pool = af
  }

  if (typeof budget === 'number' && detectedCategory) {
    const bf = pool.filter(s => {
      const price = getServicePrice(s, detectedCategory)
      return price != null && price <= budget
    })
    if (bf.length > 0) pool = bf
  }

  // Build sections
  const sections = []
  const usedIds = new Set()

  if (detectedCategory) {
    for (const def of SERVICE_CATEGORIES[detectedCategory].sections) {
      let sShops = pool.filter(def.filter).sort(def.sort).slice(0, def.maxShow)
      sShops = sShops.filter(s => !usedIds.has(s.id))
      if (sShops.length) {
        sShops.forEach(s => usedIds.add(s.id))
        sections.push({ key: def.key, label: def.label, isTopSection: !!def.isTopSection, shops: sShops })
      }
    }
    const remaining = pool.filter(s => !usedIds.has(s.id))
    if (remaining.length) {
      sections.push({ key: 'more', label: '🔎 More Options', isTopSection: false,
        shops: remaining.sort((a,b) => b.rating - a.rating) })
    }
  } else {
    sections.push({ key: 'results', label: '⭐ Best Matches', isTopSection: true,
      shops: pool.sort((a,b) => b.rating - a.rating).slice(0, 8) })
  }

  const parts = []
  if (detectedCategory) parts.push(SERVICE_CATEGORIES[detectedCategory].label)
  if (detectedArea) parts.push(`in ${detectedArea.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}`)
  if (typeof budget === 'number') parts.push(`under $${budget}`)

  const total = sections.reduce((acc, s) => acc + s.shops.length, 0)
  const explanation = total > 0
    ? `Found ${total} shop${total!==1?'s':''} for ${parts.join(', ') || `"${query}"`}. Organized by category below.`
    : `No shops matched. Try a broader term like "window tint" or "detailing".`

  return {
    sections,
    detectedCategory,
    detectedArea,
    explanation,
    lawNote: detectedCategory === 'tint' ? benchmarks.tint.texasLaw : '',
    totalShops: total,
  }
}
