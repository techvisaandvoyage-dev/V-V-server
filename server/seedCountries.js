/**
 * One-time seed script — populates the Country collection from the static list.
 * Run manually:  node seedCountries.js
 * Or called automatically by server.js on first boot when collection is empty.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Country = require('./models/Country');
const connectDB = require('./config/db');

// ── Helpers ─────────────────────────────────────────────────────
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const DEFAULT_REQUIREMENTS = [
  'Valid passport (6+ months)',
  'Completed visa application form',
  'Passport-size photograph',
  'Travel itinerary',
  'Proof of funds',
];

const DEFAULT_REQUIRED_DOCS = ['passport'];
const DEFAULT_IMAGE_URL = '/uploads/country-images/default-visa-card.svg';

const COUNTRY_NAMES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia',
  'Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica',
  "Cote d'Ivoire",'Croatia','Cuba','Cyprus','Czechia','Democratic Republic of the Congo','Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea',
  'Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico',
  'Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru',
  'Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const FEATURED_OVERRIDES = {
  'united states':       { slug: 'usa',      flagEmoji: '🇺🇸', basePrice: 15400, processingDays: '3-5',   difficulty: 'moderate', visaType: 'B1/B2 Tourist',      continent: 'Americas', trending: true,  successRate: 78 },
  'united kingdom':      { slug: 'uk',       flagEmoji: '🇬🇧', basePrice: 9500,  processingDays: '3-8',   difficulty: 'moderate', visaType: 'Standard Visitor',    continent: 'Europe', trending: true,  successRate: 82 },
  canada:                {                   flagEmoji: '🇨🇦', basePrice: 8300,  processingDays: '14-28', difficulty: 'moderate', visaType: 'Temporary Resident',  continent: 'Americas', trending: true,  successRate: 73 },
  'united arab emirates':{ slug: 'uae',      flagEmoji: '🇦🇪', basePrice: 5000,  processingDays: '2-4',   difficulty: 'easy',     visaType: 'Tourist Visa',        continent: 'Middle East', trending: true,  successRate: 94 },
  japan:                 {                   flagEmoji: '🇯🇵', basePrice: 2100,  processingDays: '5-7',   difficulty: 'easy',     visaType: 'Temporary Visitor',   continent: 'Asia', trending: true,  successRate: 91 },
  australia:             {                   flagEmoji: '🇦🇺', basePrice: 12000, processingDays: '10-25', difficulty: 'hard',     visaType: 'Tourist Visa (600)',  continent: 'Oceania', trending: true,  successRate: 71 },
  singapore:             {                   flagEmoji: '🇸🇬', basePrice: 2500,  processingDays: '3-5',   difficulty: 'easy',     visaType: 'Social Visit Pass',   continent: 'Asia', trending: true,  successRate: 96 },
  turkey:                {                   flagEmoji: '🇹🇷', basePrice: 4150,  processingDays: '1-3',   difficulty: 'easy',     visaType: 'e-Visa',              continent: 'Europe/Asia', trending: true,  successRate: 97 },
  india:                 {                   flagEmoji: '🇮🇳', basePrice: 2100,  processingDays: '3-5',   difficulty: 'easy',     visaType: 'e-Tourist Visa',      continent: 'Asia', trending: true,  successRate: 92 },
  france:                {                   flagEmoji: '🇫🇷', basePrice: 7500,  processingDays: '5-15',  difficulty: 'moderate', visaType: 'Type C Schengen',     continent: 'Europe', trending: true,  successRate: 83 },
  thailand:              {                   flagEmoji: '🇹🇭', basePrice: 2900,  processingDays: '1-2',   difficulty: 'easy',     visaType: 'Tourist Visa',        continent: 'Asia', trending: true,  successRate: 95 },
  
  // Additional countries with images
  indonesia:             {                   flagEmoji: '🇮🇩', basePrice: 3500, processingDays: '3-5', difficulty: 'easy', visaType: 'Visa on Arrival', continent: 'Asia', trending: true, successRate: 93 },
  germany:               {                   flagEmoji: '🇩🇪', basePrice: 7200, processingDays: '5-15', difficulty: 'moderate', visaType: 'Schengen', continent: 'Europe', trending: true, successRate: 84 },
  italy:                 {                   flagEmoji: '🇮🇹', basePrice: 6800, processingDays: '5-15', difficulty: 'moderate', visaType: 'Schengen', continent: 'Europe', trending: true, successRate: 85 },
  spain:                 {                   flagEmoji: '🇪🇸', basePrice: 6500, processingDays: '5-15', difficulty: 'moderate', visaType: 'Schengen', continent: 'Europe', trending: true, successRate: 86 },
  'new zealand':         {                   flagEmoji: '🇳🇿', basePrice: 9800, processingDays: '10-20', difficulty: 'moderate', visaType: 'Tourist Visa', continent: 'Oceania', trending: true, successRate: 82 },
  switzerland:           {                   flagEmoji: '🇨🇭', basePrice: 8500, processingDays: '5-15', difficulty: 'moderate', visaType: 'Schengen', continent: 'Europe', trending: false, successRate: 81 },
  netherlands:           {                   flagEmoji: '🇳🇱', basePrice: 6800, processingDays: '5-15', difficulty: 'moderate', visaType: 'Schengen', continent: 'Europe', trending: false, successRate: 87 },
  'south korea':         {                   flagEmoji: '🇰🇷', basePrice: 3200, processingDays: '3-5', difficulty: 'easy', visaType: 'Tourist Visa', continent: 'Asia', trending: false, successRate: 89 },
  'saudi arabia':        {                   flagEmoji: '🇸🇦', basePrice: 4500, processingDays: '3-5', difficulty: 'moderate', visaType: 'Tourist eVisa', continent: 'Middle East', trending: false, successRate: 88 },
  morocco:               {                   flagEmoji: '🇲🇦', basePrice: 2800, processingDays: '2-3', difficulty: 'easy', visaType: 'Visa Free', continent: 'Africa', trending: false, successRate: 90 },
};

// Preserve the imageUrl values that are already working in MongoDB.
// This keeps all 195 country cards using DB images during a force re-seed.
function buildExistingImageLookup(existingCountries = []) {
  const lookup = new Map();

  for (const country of existingCountries) {
    if (!country?.imageUrl) continue;
    if (country.slug) lookup.set(country.slug.toLowerCase(), country.imageUrl);
    if (country.name) lookup.set(country.name.toLowerCase(), country.imageUrl);
  }

  return lookup;
}

function buildCountries(existingImageLookup = new Map()) {
  return COUNTRY_NAMES.map((name, index) => {
    const key = name.toLowerCase();
    const ov = FEATURED_OVERRIDES[key] || {};
    const slug = ov.slug || slugify(name);
    const mongoImageUrl = existingImageLookup.get(slug.toLowerCase()) || existingImageLookup.get(key);
    return {
      slug,
      name,
      flagEmoji:        ov.flagEmoji        || '🌍',
      basePrice:        ov.basePrice        || (3500 + (index % 10) * 500),
      processingDays:   ov.processingDays   || (index % 3 === 0 ? '2-5' : '4-10'),
      difficulty:       ov.difficulty       || (index % 4 === 0 ? 'easy' : 'moderate'),
      visaType:         ov.visaType         || 'Tourist Visa',
      continent:        ov.continent        || 'Global',
      imageUrl:         mongoImageUrl       || DEFAULT_IMAGE_URL,
      description:      `Explore ${name} with simplified visa support and travel guidance.`,
      requirements:     DEFAULT_REQUIREMENTS,
      requiredDocuments: DEFAULT_REQUIRED_DOCS,
      trending:         Boolean(ov.trending),
      successRate:      ov.successRate      || 80 + (index % 16),
    };
  });
}

async function seedCountries(forceReseed = false) {
  const existing = await Country.countDocuments();
  if (existing > 0 && !forceReseed) {
    console.log(`✓ Country collection already has ${existing} entries — skipping bulk seed.`);
    return;
  }

  const existingCountries = existing > 0
    ? await Country.find({}, { name: 1, slug: 1, imageUrl: 1 }).lean()
    : [];
  const existingImageLookup = buildExistingImageLookup(existingCountries);

  if (forceReseed && existing > 0) {
    await Country.deleteMany({});
    console.log(`  Cleared existing countries for re-seed. Preserved ${existingImageLookup.size} image URL lookup entries.`);
  }

  const countries = buildCountries(existingImageLookup);
  await Country.insertMany(countries, { ordered: false });
  console.log(`✓ Seeded ${countries.length} countries into MongoDB.`);
}

/**
 * Insert any countries from the canonical list (195) that are missing in MongoDB.
 * Safe to run on every server start — no deletes, preserves existing documents.
 */
async function syncMissingCountries() {
  const existing = await Country.find({}, { slug: 1, name: 1, imageUrl: 1 }).lean();
  const existingSlugs = new Set(existing.map((c) => String(c.slug || '').toLowerCase()));
  const existingImageLookup = buildExistingImageLookup(existing);
  const countries = buildCountries(existingImageLookup);

  let added = 0;
  for (const doc of countries) {
    const s = String(doc.slug || '').toLowerCase();
    if (!s || existingSlugs.has(s)) continue;
    await Country.create(doc);
    existingSlugs.add(s);
    added += 1;
  }

  const total = await Country.countDocuments();
  if (added > 0) {
    console.log(`✓ Synced ${added} missing countries (list ${countries.length}, DB now ${total}).`);
  } else if (total < countries.length) {
    console.log(`⚠ MongoDB has ${total} countries; canonical list has ${countries.length}. Try: node seedCountries.js --sync`);
  }
}

// ── Run as standalone script ─────────────────────────────────────
if (require.main === module) {
  (async () => {
    await connectDB();
    const force = process.argv.includes('--force');
    const syncOnly = process.argv.includes('--sync') && !force;

    if (syncOnly) {
      await syncMissingCountries();
    } else {
      await seedCountries(force);
      if (!force) await syncMissingCountries();
    }

    await mongoose.disconnect();
    console.log('Done.');
  })();
}

module.exports = { seedCountries, syncMissingCountries };
