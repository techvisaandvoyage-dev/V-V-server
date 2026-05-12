/**
 * Script to update all countries with beautiful Unsplash images
 * Usage: node updateCountryImages.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Country = require('./models/Country');
const connectDB = require('./config/db');

// Extensive image URL mapping for countries
const COUNTRY_IMAGES = {
  'afghanistan': '/uploads/country-images/default-visa-card.svg',
  'albania': '/uploads/country-images/default-visa-card.svg',
  'algeria': '/uploads/country-images/default-visa-card.svg',
  'andorra': '/uploads/country-images/default-visa-card.svg',
  'angola': '/uploads/country-images/default-visa-card.svg',
  'antigua and barbuda': '/uploads/country-images/default-visa-card.svg',
  'argentina': '/uploads/country-images/default-visa-card.svg',
  'armenia': '/uploads/country-images/default-visa-card.svg',
  'australia': '/uploads/country-images/default-visa-card.svg',
  'austria': '/uploads/country-images/default-visa-card.svg',
  'azerbaijan': '/uploads/country-images/default-visa-card.svg',
  'bahamas': '/uploads/country-images/default-visa-card.svg',
  'bahrain': '/uploads/country-images/default-visa-card.svg',
  'bangladesh': '/uploads/country-images/default-visa-card.svg',
  'barbados': '/uploads/country-images/default-visa-card.svg',
  'belarus': '/uploads/country-images/default-visa-card.svg',
  'belgium': '/uploads/country-images/default-visa-card.svg',
  'belize': '/uploads/country-images/default-visa-card.svg',
  'benin': '/uploads/country-images/default-visa-card.svg',
  'bhutan': '/uploads/country-images/default-visa-card.svg',
  'bolivia': '/uploads/country-images/default-visa-card.svg',
  'bosnia and herzegovina': '/uploads/country-images/default-visa-card.svg',
  'botswana': '/uploads/country-images/default-visa-card.svg',
  'brazil': '/uploads/country-images/default-visa-card.svg',
  'brunei': '/uploads/country-images/default-visa-card.svg',
  'bulgaria': '/uploads/country-images/default-visa-card.svg',
  'burkina faso': '/uploads/country-images/default-visa-card.svg',
  'burundi': '/uploads/country-images/default-visa-card.svg',
  'cabo verde': '/uploads/country-images/default-visa-card.svg',
  'cambodia': '/uploads/country-images/default-visa-card.svg',
  'cameroon': '/uploads/country-images/default-visa-card.svg',
  'canada': '/uploads/country-images/default-visa-card.svg',
  'central african republic': '/uploads/country-images/default-visa-card.svg',
  'chad': '/uploads/country-images/default-visa-card.svg',
  'chile': '/uploads/country-images/default-visa-card.svg',
  'china': '/uploads/country-images/default-visa-card.svg',
  'colombia': '/uploads/country-images/default-visa-card.svg',
  'comoros': '/uploads/country-images/default-visa-card.svg',
  'congo': '/uploads/country-images/default-visa-card.svg',
  'costa rica': '/uploads/country-images/default-visa-card.svg',
  'cote d\'ivoire': '/uploads/country-images/default-visa-card.svg',
  'croatia': '/uploads/country-images/default-visa-card.svg',
  'cuba': '/uploads/country-images/default-visa-card.svg',
  'cyprus': '/uploads/country-images/default-visa-card.svg',
  'czechia': '/uploads/country-images/default-visa-card.svg',
  'democratic republic of the congo': '/uploads/country-images/default-visa-card.svg',
  'denmark': '/uploads/country-images/default-visa-card.svg',
  'djibouti': '/uploads/country-images/default-visa-card.svg',
  'dominica': '/uploads/country-images/default-visa-card.svg',
  'dominican republic': '/uploads/country-images/default-visa-card.svg',
  'ecuador': '/uploads/country-images/default-visa-card.svg',
  'egypt': '/uploads/country-images/default-visa-card.svg',
  'el salvador': '/uploads/country-images/default-visa-card.svg',
  'equatorial guinea': '/uploads/country-images/default-visa-card.svg',
  'eritrea': '/uploads/country-images/default-visa-card.svg',
  'estonia': '/uploads/country-images/default-visa-card.svg',
  'eswatini': '/uploads/country-images/default-visa-card.svg',
  'ethiopia': '/uploads/country-images/default-visa-card.svg',
  'fiji': '/uploads/country-images/default-visa-card.svg',
  'finland': '/uploads/country-images/default-visa-card.svg',
  'france': '/uploads/country-images/default-visa-card.svg',
  'gabon': '/uploads/country-images/default-visa-card.svg',
  'gambia': '/uploads/country-images/default-visa-card.svg',
  'georgia': '/uploads/country-images/default-visa-card.svg',
  'germany': '/uploads/country-images/default-visa-card.svg',
  'ghana': '/uploads/country-images/default-visa-card.svg',
  'greece': '/uploads/country-images/default-visa-card.svg',
  'grenada': '/uploads/country-images/default-visa-card.svg',
  'guatemala': '/uploads/country-images/default-visa-card.svg',
  'guinea': '/uploads/country-images/default-visa-card.svg',
  'guinea-bissau': '/uploads/country-images/default-visa-card.svg',
  'guyana': '/uploads/country-images/default-visa-card.svg',
  'haiti': '/uploads/country-images/default-visa-card.svg',
  'honduras': '/uploads/country-images/default-visa-card.svg',
  'hungary': '/uploads/country-images/default-visa-card.svg',
  'iceland': '/uploads/country-images/default-visa-card.svg',
  'india': '/uploads/country-images/default-visa-card.svg',
  'indonesia': '/uploads/country-images/default-visa-card.svg',
  'iran': '/uploads/country-images/default-visa-card.svg',
  'iraq': '/uploads/country-images/default-visa-card.svg',
  'ireland': '/uploads/country-images/default-visa-card.svg',
  'israel': '/uploads/country-images/default-visa-card.svg',
  'italy': '/uploads/country-images/default-visa-card.svg',
  'jamaica': '/uploads/country-images/default-visa-card.svg',
  'japan': '/uploads/country-images/default-visa-card.svg',
  'jordan': '/uploads/country-images/default-visa-card.svg',
  'kazakhstan': '/uploads/country-images/default-visa-card.svg',
  'kenya': '/uploads/country-images/default-visa-card.svg',
  'kiribati': '/uploads/country-images/default-visa-card.svg',
  'kuwait': '/uploads/country-images/default-visa-card.svg',
  'kyrgyzstan': '/uploads/country-images/default-visa-card.svg',
  'laos': '/uploads/country-images/default-visa-card.svg',
  'latvia': '/uploads/country-images/default-visa-card.svg',
  'lebanon': '/uploads/country-images/default-visa-card.svg',
  'lesotho': '/uploads/country-images/default-visa-card.svg',
  'liberia': '/uploads/country-images/default-visa-card.svg',
  'libya': '/uploads/country-images/default-visa-card.svg',
  'liechtenstein': '/uploads/country-images/default-visa-card.svg',
  'lithuania': '/uploads/country-images/default-visa-card.svg',
  'luxembourg': '/uploads/country-images/default-visa-card.svg',
  'madagascar': '/uploads/country-images/default-visa-card.svg',
  'malawi': '/uploads/country-images/default-visa-card.svg',
  'malaysia': '/uploads/country-images/default-visa-card.svg',
  'maldives': '/uploads/country-images/default-visa-card.svg',
  'mali': '/uploads/country-images/default-visa-card.svg',
  'malta': '/uploads/country-images/default-visa-card.svg',
  'marshall islands': '/uploads/country-images/default-visa-card.svg',
  'mauritania': '/uploads/country-images/default-visa-card.svg',
  'mauritius': '/uploads/country-images/default-visa-card.svg',
  'mexico': '/uploads/country-images/default-visa-card.svg',
  'micronesia': '/uploads/country-images/default-visa-card.svg',
  'moldova': '/uploads/country-images/default-visa-card.svg',
  'monaco': '/uploads/country-images/default-visa-card.svg',
  'mongolia': '/uploads/country-images/default-visa-card.svg',
  'montenegro': '/uploads/country-images/default-visa-card.svg',
  'morocco': '/uploads/country-images/default-visa-card.svg',
  'mozambique': '/uploads/country-images/default-visa-card.svg',
  'myanmar': '/uploads/country-images/default-visa-card.svg',
  'namibia': '/uploads/country-images/default-visa-card.svg',
  'nauru': '/uploads/country-images/default-visa-card.svg',
  'nepal': '/uploads/country-images/default-visa-card.svg',
  'netherlands': '/uploads/country-images/default-visa-card.svg',
  'new zealand': '/uploads/country-images/default-visa-card.svg',
  'nicaragua': '/uploads/country-images/default-visa-card.svg',
  'niger': '/uploads/country-images/default-visa-card.svg',
  'nigeria': '/uploads/country-images/default-visa-card.svg',
  'north korea': '/uploads/country-images/default-visa-card.svg',
  'north macedonia': '/uploads/country-images/default-visa-card.svg',
  'norway': '/uploads/country-images/default-visa-card.svg',
  'oman': '/uploads/country-images/default-visa-card.svg',
  'pakistan': '/uploads/country-images/default-visa-card.svg',
  'palau': '/uploads/country-images/default-visa-card.svg',
  'palestine': '/uploads/country-images/default-visa-card.svg',
  'panama': '/uploads/country-images/default-visa-card.svg',
  'papua new guinea': '/uploads/country-images/default-visa-card.svg',
  'paraguay': '/uploads/country-images/default-visa-card.svg',
  'peru': '/uploads/country-images/default-visa-card.svg',
  'philippines': '/uploads/country-images/default-visa-card.svg',
  'poland': '/uploads/country-images/default-visa-card.svg',
  'portugal': '/uploads/country-images/default-visa-card.svg',
  'qatar': '/uploads/country-images/default-visa-card.svg',
  'romania': '/uploads/country-images/default-visa-card.svg',
  'russia': '/uploads/country-images/default-visa-card.svg',
  'rwanda': '/uploads/country-images/default-visa-card.svg',
  'saint kitts and nevis': '/uploads/country-images/default-visa-card.svg',
  'saint lucia': '/uploads/country-images/default-visa-card.svg',
  'saint vincent and the grenadines': '/uploads/country-images/default-visa-card.svg',
  'samoa': '/uploads/country-images/default-visa-card.svg',
  'san marino': '/uploads/country-images/default-visa-card.svg',
  'sao tome and principe': '/uploads/country-images/default-visa-card.svg',
  'saudi arabia': '/uploads/country-images/default-visa-card.svg',
  'senegal': '/uploads/country-images/default-visa-card.svg',
  'serbia': '/uploads/country-images/default-visa-card.svg',
  'seychelles': '/uploads/country-images/default-visa-card.svg',
  'sierra leone': '/uploads/country-images/default-visa-card.svg',
  'singapore': '/uploads/country-images/default-visa-card.svg',
  'slovakia': '/uploads/country-images/default-visa-card.svg',
  'slovenia': '/uploads/country-images/default-visa-card.svg',
  'solomon islands': '/uploads/country-images/default-visa-card.svg',
  'somalia': '/uploads/country-images/default-visa-card.svg',
  'south africa': '/uploads/country-images/default-visa-card.svg',
  'south korea': '/uploads/country-images/default-visa-card.svg',
  'south sudan': '/uploads/country-images/default-visa-card.svg',
  'spain': '/uploads/country-images/default-visa-card.svg',
  'sri lanka': '/uploads/country-images/default-visa-card.svg',
  'sudan': '/uploads/country-images/default-visa-card.svg',
  'suriname': '/uploads/country-images/default-visa-card.svg',
  'sweden': '/uploads/country-images/default-visa-card.svg',
  'switzerland': '/uploads/country-images/default-visa-card.svg',
  'syria': '/uploads/country-images/default-visa-card.svg',
  'tajikistan': '/uploads/country-images/default-visa-card.svg',
  'tanzania': '/uploads/country-images/default-visa-card.svg',
  'thailand': '/uploads/country-images/default-visa-card.svg',
  'timor-leste': '/uploads/country-images/default-visa-card.svg',
  'togo': '/uploads/country-images/default-visa-card.svg',
  'tonga': '/uploads/country-images/default-visa-card.svg',
  'trinidad and tobago': '/uploads/country-images/default-visa-card.svg',
  'tunisia': '/uploads/country-images/default-visa-card.svg',
  'turkey': '/uploads/country-images/default-visa-card.svg',
  'turkmenistan': '/uploads/country-images/default-visa-card.svg',
  'tuvalu': '/uploads/country-images/default-visa-card.svg',
  'uganda': '/uploads/country-images/default-visa-card.svg',
  'ukraine': '/uploads/country-images/default-visa-card.svg',
  'united arab emirates': '/uploads/country-images/default-visa-card.svg',
  'united kingdom': '/uploads/country-images/default-visa-card.svg',
  'united states': '/uploads/country-images/default-visa-card.svg',
  'uruguay': '/uploads/country-images/default-visa-card.svg',
  'uzbekistan': '/uploads/country-images/default-visa-card.svg',
  'vanuatu': '/uploads/country-images/default-visa-card.svg',
  'vatican city': '/uploads/country-images/default-visa-card.svg',
  'venezuela': '/uploads/country-images/default-visa-card.svg',
  'vietnam': '/uploads/country-images/default-visa-card.svg',
  'yemen': '/uploads/country-images/default-visa-card.svg',
  'zambia': '/uploads/country-images/default-visa-card.svg',
  'zimbabwe': '/uploads/country-images/default-visa-card.svg',
};

// Default image for countries without specific mapping
const DEFAULT_IMAGE = '/uploads/country-images/default-visa-card.svg';

async function updateCountryImages() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all countries
    const countries = await Country.find();
    console.log(`Found ${countries.length} countries`);

    let updated = 0;
    let skipped = 0;

    // Update each country with image
    for (const country of countries) {
      const countryKey = country.name.toLowerCase();
      const imageUrl = COUNTRY_IMAGES[countryKey] || DEFAULT_IMAGE;

      if (!country.imageUrl || country.imageUrl === '') {
        country.imageUrl = imageUrl;
        await country.save();
        updated++;
        console.log(`✓ Updated: ${country.name} with image`);
      } else {
        skipped++;
      }
    }

    console.log(`\n✅ Update complete:`);
    console.log(`   Updated: ${updated} countries`);
    console.log(`   Already had images: ${skipped} countries`);

    process.exit(0);
  } catch (err) {
    console.error('Error updating images:', err);
    process.exit(1);
  }
}

updateCountryImages();
