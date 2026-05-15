/**
 * Extra Unsplash phrases per country slug (MongoDB `Country.slug`), tried after plain name searches.
 * Use for disambiguation (e.g. Georgia) or to bias toward a well-known landmark when the name-only results are weak.
 * Keys are lowercase slugs (same as seed / Country.slug).
 */
const SLUG_IMAGE_HINTS = {
  india: ['Taj Mahal Agra India', 'Jaipur Amber Fort India', 'Delhi Red Fort India'],
  china: ['Great Wall of China Mutianyu', 'Forbidden City Beijing China', 'Shanghai Bund skyline China'],
  france: ['Eiffel Tower Paris France', 'Arc de Triomphe Paris', 'Louvre Museum Paris France'],
  japan: ['Mount Fuji Japan cherry blossom', 'Senso-ji Temple Tokyo Japan', 'Fushimi Inari Kyoto Japan'],
  usa: ['Statue of Liberty New York USA', 'Golden Gate Bridge San Francisco', 'Chicago skyline USA'],
  uk: ['Big Ben London United Kingdom', 'Tower Bridge London UK', 'Edinburgh Castle Scotland'],
  uae: ['Burj Khalifa Dubai UAE', 'Sheikh Zayed Grand Mosque Abu Dhabi'],
  italy: ['Colosseum Rome Italy', 'Venice Grand Canal Italy', 'Duomo Florence Italy'],
  spain: ['Sagrada Familia Barcelona Spain', 'Alhambra Granada Spain', 'Park Guell Barcelona'],
  germany: ['Brandenburg Gate Berlin Germany', 'Neuschwanstein Castle Germany', 'Cologne Cathedral Germany'],
  greece: ['Santorini Greece blue domes', 'Acropolis Athens Greece', 'Parthenon Athens'],
  egypt: ['Pyramids of Giza Egypt', 'Karnak Temple Luxor Egypt', 'Abu Simbel Egypt'],
  turkey: ['Hagia Sophia Istanbul Turkey', 'Blue Mosque Istanbul', 'Cappadocia hot air balloons Turkey'],
  thailand: ['Wat Arun Bangkok Thailand', 'Grand Palace Bangkok Thailand', 'Phi Phi Islands Thailand'],
  brazil: ['Christ the Redeemer Rio Brazil', 'Sugarloaf Mountain Rio', 'Iguazu Falls Brazil'],
  mexico: ['Chichen Itza Mexico pyramid', 'Mexico City Zocalo', 'Cancun turquoise beach Mexico'],
  canada: ['Banff Lake Louise Canada', 'CN Tower Toronto Canada', 'Old Quebec city Canada'],
  australia: ['Sydney Opera House Australia', 'Harbour Bridge Sydney', 'Uluru Australia'],
  singapore: ['Marina Bay Sands Singapore night', 'Gardens by the Bay Singapore', 'Merlion Singapore', 'Singapore skyline vibrant'],
  'south-korea': ['Gyeongbokgung Palace Seoul Korea', 'N Seoul Tower night', 'Bukchon Hanok Village Seoul'],
  vietnam: ['Ha Long Bay Vietnam', 'Hoi An ancient town Vietnam', 'Ho Chi Minh City skyline Vietnam'],
  indonesia: ['Borobudur Temple Indonesia', 'Bali rice terraces Indonesia', 'Prambanan Yogyakarta'],
  malaysia: ['Petronas Towers Kuala Lumpur', 'George Town Penang Malaysia', 'Malacca historic Malaysia'],
  'saudi-arabia': ['Madain Saleh Saudi Arabia', 'Riyadh skyline Saudi', 'Jeddah waterfront Saudi Arabia'],
  russia: ['Saint Basil Cathedral Moscow', 'Hermitage Saint Petersburg Russia', 'Red Square Moscow'],
  portugal: ['Belem Tower Lisbon Portugal', 'Porto Ribeira Portugal', 'Pena Palace Sintra Portugal'],
  netherlands: ['Amsterdam canals Netherlands', 'Kinderdijk windmills Netherlands', 'Rotterdam cube houses'],
  iceland: ['Skogafoss waterfall Iceland', 'Diamond Beach Iceland', 'Kirkjufell mountain Iceland'],
  norway: ['Lofoten Islands Norway', 'Geirangerfjord Norway', 'Preikestolen Pulpit Rock Norway'],
  switzerland: ['Zermatt Matterhorn Switzerland', 'Lauterbrunnen valley Switzerland', 'Interlaken Switzerland'],
  austria: ['Hallstatt Austria lake village', 'Salzburg Old Town Austria', 'Vienna Belvedere Palace'],
  belgium: ['Bruges canal Belgium', 'Grand Place Brussels night', 'Ghent canals Belgium'],
  poland: ['Krakow Main Market Square Poland', 'Warsaw Old Town Market Place', 'Tatra Mountains Poland'],
  ireland: ['Cliffs of Moher Ireland sunset', 'Ring of Kerry Ireland', 'Trinity College Library Dublin'],
  denmark: ['Nyhavn Copenhagen Denmark vibrant', 'Frederiksborg Castle Denmark'],
  'new-zealand': ['Milford Sound New Zealand waterfall', 'Hobbiton Movie Set New Zealand', 'Lake Pukaki New Zealand'],
  argentina: ['Perito Moreno Glacier Argentina', 'Iguazu Falls Argentina', 'Patagonia Argentina Fitz Roy'],
  chile: ['Torres del Paine Chile', 'Valparaiso colorful houses Chile', 'Atacama Desert Chile'],
  peru: ['Machu Picchu Peru', 'Cusco Peru Plaza de Armas', 'Rainbow Mountain Peru'],
  colombia: ['Cartagena old city Colombia', 'Cocora Valley Colombia wax palms', 'Bogota Monserrate'],
  'south-africa': ['Table Mountain Cape Town South Africa', 'Kruger National Park South Africa'],
  kenya: ['Maasai Mara Kenya safari', 'Amboseli elephants Kenya', 'Nairobi Kenya skyline'],
  morocco: ['Chefchaouen blue city Morocco', 'Jemaa el-Fnaa Marrakech', 'Hassan II Mosque Casablanca'],
  nigeria: ['Lagos Nigeria skyline', 'Zuma Rock Nigeria', 'Abuja National Mosque Nigeria'],
  israel: ['Western Wall Jerusalem Israel', 'Tel Aviv beach Israel', 'Dead Sea Israel'],
  jordan: ['Petra Jordan Treasury', 'Wadi Rum Jordan desert', 'Amman citadel Jordan'],
  lebanon: ['Beirut Raouche rocks Lebanon', 'Baalbek ruins Lebanon'],
  nepal: ['Mount Everest view Nepal', 'Kathmandu Durbar Square Nepal', 'Boudhanath stupa Nepal'],
  'sri-lanka': ['Sigiriya rock Sri Lanka', 'Nine Arch Bridge Ella Sri Lanka', 'Galle Fort Sri Lanka'],
  bangladesh: ['Sundarbans mangrove Bangladesh', 'Dhaka Lalbagh Fort Bangladesh'],
  pakistan: ['Badshahi Mosque Lahore Pakistan', 'Hunza Valley Pakistan', 'Faisal Mosque Islamabad'],
  philippines: ['Palawan El Nido Philippines', 'Chocolate Hills Bohol Philippines', 'Banaue rice terraces Philippines'],
  myanmar: ['Bagan temples Myanmar sunrise', 'Shwedagon Pagoda Yangon Myanmar'],
  cambodia: ['Angkor Wat Cambodia sunrise', 'Bayon temple Cambodia'],
  laos: ['Kuang Si Falls Laos', 'Luang Prabang Laos temples'],
  mongolia: ['Gobi Desert Mongolia', 'Ulaanbaatar Genghis square Mongolia'],
  georgia: ['Tbilisi old town Georgia country', 'Kazbegi Gergeti Trinity Church Georgia'],
  ukraine: ['Kyiv Saint Sophia Cathedral Ukraine', 'Lviv old town Ukraine', 'Odessa Opera Ukraine'],
  romania: ['Bran Castle Romania', 'Peles Castle Romania', 'Bucharest Palace of Parliament'],
  serbia: ['Belgrade fortress Serbia', 'Saint Sava Temple Belgrade'],
  slovakia: ['Bratislava castle Slovakia', 'High Tatras Slovakia'],
  slovenia: ['Lake Bled Slovenia', 'Ljubljana castle Slovenia'],
  'north-macedonia': ['Ohrid lake North Macedonia', 'Skopje Macedonia Kale fortress'],
  albania: ['Berat Albania old town', 'Tirana Albania Skanderbeg'],
  'bosnia-and-herzegovina': ['Mostar bridge Bosnia', 'Sarajevo old town Bosnia'],
  montenegro: ['Kotor Bay Montenegro', 'Sveti Stefan Montenegro'],
  estonia: ['Tallinn old town Estonia', 'Lahemaa Estonia'],
  latvia: ['Riga old town Latvia', 'Jurmala beach Latvia'],
  lithuania: ['Vilnius old town Lithuania', 'Trakai island castle Lithuania'],
  luxembourg: ['Luxembourg city Grund', 'Vianden Castle Luxembourg'],
  malta: ['Valletta Malta Grand Harbour', 'Blue Grotto Malta'],
  cyprus: ['Ayia Napa Cyprus sea caves', 'Paphos Cyprus harbour'],
  tunisia: ['Sidi Bou Said Tunisia blue', 'Carthage ruins Tunisia', 'Sahara desert Tunisia'],
  algeria: ['Algiers Casbah Algeria', 'Timgad Roman ruins Algeria'],
  ethiopia: ['Lalibela rock churches Ethiopia', 'Simien Mountains Ethiopia'],
  tanzania: ['Serengeti Tanzania safari', 'Mount Kilimanjaro Tanzania', 'Zanzibar Stone Town'],
  'costa-rica': ['Arenal volcano Costa Rica', 'Monteverde cloud forest Costa Rica'],
  cuba: ['Havana old cars Cuba', 'Trinidad Cuba colonial'],
  ecuador: ['Quito historic center Ecuador', 'Galapagos Islands Ecuador'],
  bolivia: ['Salar de Uyuni Bolivia', 'La Paz Bolivia cable car'],
  uruguay: ['Montevideo Ciudad Vieja Uruguay', 'Punta del Este Uruguay'],
  paraguay: ['Asuncion Paraguay skyline', 'Iguazu Paraguay side'],
  venezuela: ['Angel Falls Venezuela', 'Los Roques Venezuela'],
  guatemala: ['Tikal Guatemala Mayan ruins', 'Antigua Guatemala volcanoes'],
  honduras: ['Copan ruins Honduras', 'Roatan Honduras beach'],
  panama: ['Panama Canal locks', 'Panama City skyline Casco Viejo'],
  'dominican-republic': ['Punta Cana beach Dominican Republic', 'Santo Domingo colonial zone'],
  jamaica: ['Dunn River Falls Jamaica', 'Montego Bay Jamaica beach'],
  fiji: ['Fiji islands turquoise water', 'Mamanuca Fiji'],
  maldives: ['Maldives overwater bungalows', 'Maldives aerial turquoise'],
  seychelles: ['La Digue Seychelles beach', 'Praslin Seychelles'],
  mauritius: ['Le Morne Mauritius', 'Chamarel Mauritius'],
  iran: ['Naqsh-e Jahan Square Isfahan Iran', 'Persepolis Iran ruins'],
  iraq: ['Baghdad Iraq Tigris river', 'Babylon Iraq ruins'],
  afghanistan: ['Band-e Amir Afghanistan lakes', 'Herat Blue Mosque Afghanistan'],
  qatar: ['Doha West Bay skyline Qatar', 'Museum of Islamic Art Doha'],
  kuwait: ['Kuwait Towers', 'Grand Mosque Kuwait'],
  bahrain: ['Manama Bahrain skyline', 'Bahrain Fort'],
  oman: ['Sultan Qaboos Grand Mosque Muscat', 'Wadi Shab Oman'],
  yemen: ['Sanaa old city Yemen architecture', 'Socotra Yemen dragon trees'],
  kazakhstan: ['Nur-Sultan Bayterek Kazakhstan', 'Charyn Canyon Kazakhstan'],
  uzbekistan: ['Registan Samarkand Uzbekistan', 'Khiva Uzbekistan old town'],
  turkmenistan: ['Ashgabat white marble Turkmenistan', 'Darvaza gas crater Turkmenistan'],
  azerbaijan: ['Baku Flame Towers Azerbaijan', 'Old City Baku Azerbaijan'],
  armenia: ['Yerevan Cascade Armenia', 'Geghard monastery Armenia'],
};

/** Same as typing in the Unsplash search bar — tried first for natural, beautiful country results. */
function websiteStyleNameQueries(name) {
  return [
    `${name} beautiful tourism landscape`,
    `${name} iconic famous landmark`,
    `${name} vibrant travel photography`,
    `${name} tourism`,
  ];
}

/** Short landmark-oriented fallbacks after name + slug hints. */
function landmarkFallbackQueries(name) {
  return [
    `${name} majestic landscape photography`,
    `${name} cinematic travel shots`,
    `${name} stunning nature scenery`,
    `${name} luxury travel destination`,
  ];
}

/**
 * Query order: plain country name first (like unsplash.com), then slug-specific landmark hints,
 * then light landmark fallbacks. Deduped.
 * @param {{ name?: string, slug?: string }} country
 * @returns {string[]}
 */
function buildCountryImageSearchQueries(country) {
  const name = String(country?.name || '').trim();
  const slug = String(country?.slug || '').toLowerCase().trim();
  const curated = (slug && SLUG_IMAGE_HINTS[slug]) || [];

  const simple = name ? websiteStyleNameQueries(name) : [];
  const fallbacks = name ? landmarkFallbackQueries(name) : [];

  const seen = new Set();
  const out = [];
  for (const q of [...simple, ...curated, ...fallbacks]) {
    const key = q.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(q.trim());
  }
  return out;
}

module.exports = {
  SLUG_IMAGE_HINTS,
  websiteStyleNameQueries,
  landmarkFallbackQueries,
  buildCountryImageSearchQueries,
};
