/**
 * Fetch country card images from Pinterest API v5.
 *
 * Required .env:
 *   PINTEREST_ACCESS_TOKEN=your_oauth_access_token
 *
 * Optional .env:
 *   PINTEREST_BOARD_ID=board_id_containing_country_pins
 *
 * Usage:
 *   node fetchPinterestCountryImages.js
 *   node fetchPinterestCountryImages.js --only-missing
 */
const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Country = require('./models/Country');
const connectDB = require('./config/db');

const PINTEREST_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;
const PAGE_SIZE = 100;

const COUNTRY_ALIASES = {
  'united states': ['usa', 'us', 'america'],
  'united kingdom': ['uk', 'great britain', 'britain', 'england'],
  'united arab emirates': ['uae', 'dubai', 'abu dhabi'],
  'cote d\'ivoire': ['ivory coast'],
  'czechia': ['czech republic'],
  'democratic republic of the congo': ['dr congo', 'drc', 'congo kinshasa'],
  'congo': ['republic of the congo', 'congo brazzaville'],
  'south korea': ['korea'],
  'vatican city': ['holy see', 'vatican'],
};

if (!PINTEREST_TOKEN) {
  console.error('PINTEREST_ACCESS_TOKEN is missing in .env');
  console.error('Create a Pinterest developer app, generate an OAuth token, then add it to server/.env.');
  process.exit(1);
}

function pinterestGet(path, query = {}) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(query);
    const requestPath = `${path}${params.toString() ? `?${params}` : ''}`;

    const req = https.request(
      {
        hostname: 'api.pinterest.com',
        path: requestPath,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PINTEREST_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'VisaVoyageBot/1.0',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          let json = {};
          try {
            json = body ? JSON.parse(body) : {};
          } catch (err) {
            reject(new Error(`Pinterest returned invalid JSON: ${err.message}`));
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Pinterest API ${res.statusCode}: ${json.message || body}`));
            return;
          }

          resolve(json);
        });
      },
    );

    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('Pinterest API request timed out')));
    req.end();
  });
}

async function fetchAllPins() {
  const path = PINTEREST_BOARD_ID
    ? `/v5/boards/${encodeURIComponent(PINTEREST_BOARD_ID)}/pins`
    : '/v5/pins';

  const pins = [];
  let bookmark;

  do {
    const json = await pinterestGet(path, {
      page_size: String(PAGE_SIZE),
      ...(bookmark ? { bookmark } : {}),
    });

    pins.push(...(Array.isArray(json.items) ? json.items : []));
    bookmark = json.bookmark || undefined;
  } while (bookmark);

  return pins;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasWholeTerm(text, term) {
  const cleanTerm = normalizeText(term);
  return new RegExp(`(^|\\s)${cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(text);
}

function buildCountryTerms(countryName) {
  const normalized = normalizeText(countryName);
  return [normalized, ...(COUNTRY_ALIASES[normalized] || [])];
}

function collectImageCandidates(value, candidates = []) {
  if (!value || typeof value !== 'object') return candidates;

  for (const [key, item] of Object.entries(value)) {
    if (key === 'url' && typeof item === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?|$)/i.test(item)) {
      candidates.push(item);
    } else if (typeof item === 'object') {
      collectImageCandidates(item, candidates);
    }
  }

  return candidates;
}

function getBestPinImage(pin) {
  const candidates = collectImageCandidates(pin.media);
  return candidates
    .map((url) => {
      const widthMatch = url.match(/\/(\d+)x\//) || url.match(/[?&]w=(\d+)/);
      return { url, width: widthMatch ? Number(widthMatch[1]) : 0 };
    })
    .sort((a, b) => b.width - a.width)[0]?.url || null;
}

function pinSearchText(pin) {
  return normalizeText([
    pin.title,
    pin.description,
    pin.alt_text,
    pin.link,
    pin.board_id,
  ].filter(Boolean).join(' '));
}

function findImageForCountry(country, pins) {
  const terms = buildCountryTerms(country.name);

  for (const pin of pins) {
    const text = pinSearchText(pin);
    if (!terms.some((term) => hasWholeTerm(text, term))) continue;

    const imageUrl = getBestPinImage(pin);
    if (imageUrl) return imageUrl;
  }

  return null;
}

async function run() {
  const onlyMissing = process.argv.includes('--only-missing');

  await connectDB();
  const countries = await Country.find({}).sort({ name: 1 });
  const pins = await fetchAllPins();

  console.log(`Found ${countries.length} countries and ${pins.length} Pinterest pins.`);
  console.log(PINTEREST_BOARD_ID ? `Using board: ${PINTEREST_BOARD_ID}` : 'Using authenticated account pins');
  console.log(onlyMissing ? 'Updating countries with empty imageUrl only.\n' : 'Overwriting country imageUrls when a Pinterest match exists.\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const country of countries) {
    if (onlyMissing && country.imageUrl) {
      skipped++;
      continue;
    }

    const imageUrl = findImageForCountry(country, pins);
    if (!imageUrl) {
      console.log(`- No Pinterest image match: ${country.name}`);
      notFound++;
      continue;
    }

    await Country.findByIdAndUpdate(country._id, { imageUrl });
    console.log(`+ Updated ${country.name}: ${imageUrl.slice(0, 80)}...`);
    updated++;
  }

  console.log('\nDone.');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`No match: ${notFound}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Error:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
