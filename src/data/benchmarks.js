// Houston market pricing reference (for "market estimate" labels)
export const houstonMarketPricing = {
  tint: {
    standardTint:        [150, 350],
    carbonTint:          [250, 500],
    ceramicTint:         [350, 900],
    premiumCeramicTint:  [900, 1600],
    note: 'Ceramic tint costs more due to better heat rejection. Standard dyed film is cheapest but fades faster in the Houston sun.',
  },
  ppf: {
    partialFront:        [800, 2000],
    fullFront:           [2000, 4500],
    trackPack:           [2500, 5000],
    fullVehicle:         [4500, 9000],
    note: 'PPF is labor-heavy. Price varies by film brand (XPEL, STEK, SunTek) and vehicle size.',
  },
  ceramicCoating: {
    oneYear:                      [400, 700],
    threeYear:                    [600, 1200],
    fiveYear:                     [1000, 2500],
    premiumCorrectionAndCoating:  [2000, 4000],
    note: 'Paint correction before coating significantly affects final price. Always ask if it\'s included.',
  },
  detailing: {
    interiorDetail:    [130, 250],
    exteriorDetail:    [120, 250],
    fullDetail:        [250, 400],
    paintCorrection:   [400, 1200],
    note: 'Mobile detailers typically publish clearer prices. Shop-based detailing varies more by condition.',
  },
  commercialWraps: {
    letteringOnly:          [250, 900],
    partialWrap:            [1000, 2500],
    fullVehicleWrap:        [2500, 6000],
    fleetWrapPerVehicle:    [2500, 4500],
    boxTruckWrap:           [2500, 5000],
    premiumComplexWrap:     [5000, 12000],
    notes: [
      'Depends heavily on design complexity, vehicle size, print coverage, laminate, and removal/prep.',
      'Fleet pricing may be lower per vehicle when multiple cars are wrapped together.',
      'Houston sun makes premium vinyl and UV laminate especially important.',
    ],
  },
}

export const benchmarks = {
  tint: {
    basic:           { sedan: [150, 250], suv: [200, 350], truck: [250, 400] },
    carbonOrMidRange:{ sedan: [250, 400], suv: [350, 550], truck: [400, 650] },
    ceramic:         { sedan: [400, 650], suv: [550, 850], truck: [650, 1000] },
    texasLaw: "TX law: Front side windows must allow at least 25% VLT. Rear windows can be darker when factory side mirrors are present.",
  },
  ppf: {
    partialFront: [800, 2000],
    fullFront:    [2000, 4000],
    fullVehicle:  [4000, 8000],
    premiumExotic:[8000, 12000],
  },
  ceramicCoating: {
    oneYear:             [400, 700],
    entryLevel:          [600, 1200],
    threeToFiveYear:     [1200, 2500],
    paintCorrectionAddon:[275, 1150],
  },
  detailing: {
    basicWashVacuum:  [60, 110],
    exteriorDetail:   [120, 200],
    interiorDeepClean:[130, 275],
    fullDetail:       [175, 400],
    paintCorrection:  [275, 1150],
  },
  vinylWraps: {
    partialWrap:         [500, 2500],
    fullCarWrap:         [2500, 6000],
    suvOrTruckFullWrap:  [3200, 7000],
    commercialFleetWrap: [2500, 4500],
    boxTruckFullWrap:    [2500, 5000],
    letteringOnly:       [250, 900],
    chromeDelete:        [450, 1200],
    roofOrHoodWrap:      [350, 900],
  },
  commercial: {
    letteringOnly:  [250, 900],
    partialWrap: {
      sedanOrCoupe: [1000, 1800], pickup: [1200, 2000], suv: [1400, 2200],
      cargoVan:     [1600, 2400], boxTruck: [1200, 2500],
    },
    fullWrap: {
      sedanOrCoupe: [2500, 3500], pickup: [2600, 3800], suv: [2800, 4000],
      cargoVan:     [2800, 4500], boxTruck: [2500, 5000], luxuryOrComplex: [5000, 12000],
    },
  },
}

// Returns price range label for a given service category
export function getPriceRange(category) {
  switch (category) {
    case 'tint':     return `$${benchmarks.tint.basic.sedan[0]}–$${benchmarks.tint.ceramic.sedan[1]}`
    case 'wrap':     return `$${benchmarks.vinylWraps.roofOrHoodWrap[0]}–$${benchmarks.vinylWraps.fullCarWrap[1]}`
    case 'ppf':      return `$${benchmarks.ppf.partialFront[0]}–$${benchmarks.ppf.fullVehicle[1]}`
    case 'ceramic':  return `$${benchmarks.ceramicCoating.oneYear[0]}–$${benchmarks.ceramicCoating.threeToFiveYear[1]}`
    case 'detailing':return `$${benchmarks.detailing.basicWashVacuum[0]}–$${benchmarks.detailing.fullDetail[1]}`
    default:         return null
  }
}

// Returns starting price for a category (used as priceFrom when no published price)
export function getBenchmarkStart(category) {
  switch (category) {
    case 'tint':     return benchmarks.tint.basic.sedan[0]
    case 'wrap':     return benchmarks.vinylWraps.chromeDelete[0]
    case 'ppf':      return benchmarks.ppf.partialFront[0]
    case 'ceramic':  return benchmarks.ceramicCoating.oneYear[0]
    case 'detailing':return benchmarks.detailing.exteriorDetail[0]
    default:         return 149
  }
}
