/*
  Wrapedia — Houston Shop Finder
  --------------------------------
  Pulls real car wrap / tint / PPF / detailing shops from Google Places,
  then uses Claude to clean and categorize them.

  Run:
    export GOOGLE_API_KEY="your_google_key"
    export ANTHROPIC_API_KEY="your_anthropic_key"   # optional
    node scripts/find_shops.js

  Output:
    data/houston_car_shops.json          — raw Google Places data
    data/houston_car_shops_cleaned.json  — Claude-cleaned, Wrapedia-formatted
*/

import fs from 'fs/promises';
import fetch from 'node-fetch';

// ── Config ─────────────────────────────────────────────────────────────────
const HOUSTON       = { lat: 29.7604, lng: -95.3698 };
const RADIUS_METERS = 48280; // ~30 miles
const GOOGLE_KEY    = process.env.GOOGLE_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL         = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

if (!GOOGLE_KEY) {
  console.error('ERROR: Set GOOGLE_API_KEY env var before running.');
  process.exit(1);
}

// ── Search queries ──────────────────────────────────────────────────────────
const TEXT_QUERIES = [
  'car wrap shop Houston TX',
  'vehicle vinyl wrap Houston TX',
  'auto window tint Houston TX',
  'ceramic window tint Houston TX',
  'paint protection film Houston TX',
  'PPF auto shop Houston TX',
  'auto detailing Houston TX',
  'ceramic coating car Houston TX',
  'chrome delete car shop Houston TX',
];

// ── Google Places helpers ───────────────────────────────────────────────────
async function googleTextSearch(query, nextPageToken = null) {
  const params = new URLSearchParams({
    query,
    location: `${HOUSTON.lat},${HOUSTON.lng}`,
    radius: String(RADIUS_METERS),
    key: GOOGLE_KEY,
  });
  if (nextPageToken) params.set('pagetoken', nextPageToken);
  const res  = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  return res.json();
}

async function placeDetails(place_id) {
  const params = new URLSearchParams({
    place_id,
    fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types',
    key: GOOGLE_KEY,
  });
  const res  = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const json = await res.json();
  return json.result || null;
}

function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  });
}

// ── Step 1: Collect all place IDs ──────────────────────────────────────────
async function collectPlaceIds() {
  const placeIds = new Set();
  for (const query of TEXT_QUERIES) {
    process.stdout.write(`  Searching: "${query}" ... `);
    let resp = await googleTextSearch(query);
    const count = resp.results?.length ?? 0;
    resp.results?.forEach(r => placeIds.add(r.place_id));
    process.stdout.write(`${count} results\n`);

    while (resp.next_page_token) {
      await new Promise(r => setTimeout(r, 2000)); // Google requires a delay
      resp = await googleTextSearch(query, resp.next_page_token);
      resp.results?.forEach(r => placeIds.add(r.place_id));
    }
  }
  return Array.from(placeIds);
}

// ── Step 2: Fetch details in batches ────────────────────────────────────────
async function fetchAllDetails(ids) {
  const BATCH = 6;
  const out   = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch   = ids.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(id => placeDetails(id).catch(() => null)));
    results.forEach(r => { if (r) out.push(r); });
    process.stdout.write(`  Fetched ${Math.min(i + BATCH, ids.length)} / ${ids.length}\r`);
  }
  process.stdout.write('\n');
  return out;
}

// ── Step 3: Claude cleanup — uses current Messages API ─────────────────────
async function claudeClean(rawShops) {
  if (!ANTHROPIC_KEY) return null;

  console.log('\nSending to Claude for cleanup and categorization...');

  const systemPrompt = `You are a data cleaner for Wrapedia, a Houston car services marketplace.
You receive raw Google Places data and return a cleaned JSON array.
Each item must follow this exact structure:
{
  "name": "Shop Name",
  "city": "City, TX",
  "distance": "X.X mi",   // approximate distance from Houston downtown — estimate from address
  "rating": 4.8,          // from Google, or null
  "reviews": 123,         // user_ratings_total from Google, or 0
  "services": ["Window Tint", "PPF"],  // only include: Window Tint, Ceramic Tint, PPF, Full PPF, Vinyl Wrap, Color Change, Chrome Delete, Ceramic Coating, Graphene Coating, Detailing, Mobile Detailing, Paint Correction, Commercial Wraps
  "priceFrom": null,      // always null — we don't have pricing from Google
  "badge": "string or null", // Top Rated (4.8+), Best Value, PPF Specialist, etc.
  "nextAvail": "Tomorrow 10am", // realistic estimate
  "tags": ["tag1", "tag2"],  // short tags from types or name: XPEL, 3M, Avery, Mobile, etc.
  "address": "full address",
  "phone": "phone or null",
  "website": "url or null",
  "priceType": "market_estimate",
  "specialty": "lowercase keywords for search matching"
}
Return ONLY a valid JSON array with no explanation or markdown.`;

  const userMessage = `Clean this raw Google Places data into Wrapedia shop records:
${JSON.stringify(rawShops.slice(0, 80), null, 2)}`; // Claude handles ~80 at a time safely

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 8192,
      system:     systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('Anthropic API error:', err);
    return null;
  }

  const data = await resp.json();
  const text = data.content?.[0]?.text ?? '';

  try {
    return JSON.parse(text);
  } catch {
    // Claude sometimes wraps in markdown — strip it
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    console.error('Could not parse Claude JSON response');
    await fs.writeFile('./data/claude_raw_output.txt', text);
    console.log('Raw Claude output saved to ./data/claude_raw_output.txt');
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
(async function main() {
  await fs.mkdir('./data', { recursive: true });

  // Step 1
  console.log('\n📍 Step 1: Collecting place IDs from Google...');
  const ids = await collectPlaceIds();
  console.log(`✅ Found ${ids.length} unique places\n`);

  // Step 2
  console.log('📋 Step 2: Fetching full details...');
  const details = await fetchAllDetails(ids);
  const rawShops = details.map(d => ({
    name:            d.name || '',
    address:         d.formatted_address || '',
    phone:           d.formatted_phone_number || '',
    website:         d.website || '',
    rating:          d.rating ?? null,
    reviews:         d.user_ratings_total ?? 0,
    types:           d.types || [],
    place_id:        d.place_id || '',
    open_now:        d.opening_hours?.open_now ?? null,
  }));

  await fs.writeFile('./data/houston_car_shops.json', JSON.stringify(rawShops, null, 2));
  console.log(`✅ Saved ${rawShops.length} raw shops → ./data/houston_car_shops.json\n`);

  // Step 3 (optional — needs ANTHROPIC_API_KEY)
  if (ANTHROPIC_KEY) {
    const cleaned = await claudeClean(rawShops);
    if (cleaned) {
      // Add sequential IDs
      cleaned.forEach((shop, i) => { shop.id = i + 1; });
      await fs.writeFile('./data/houston_car_shops_cleaned.json', JSON.stringify(cleaned, null, 2));
      console.log(`✅ Claude cleaned ${cleaned.length} shops → ./data/houston_car_shops_cleaned.json`);
      console.log('\n💡 To use this data: copy the array from houston_car_shops_cleaned.json');
      console.log('   into src/data/shops.js and replace the existing shops array.\n');
    }
  } else {
    console.log('ℹ️  ANTHROPIC_API_KEY not set — skipping Claude cleanup step.');
    console.log('   Raw data saved to ./data/houston_car_shops.json\n');
  }
})();
