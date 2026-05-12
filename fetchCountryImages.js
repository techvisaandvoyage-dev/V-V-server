/**
 * fetchCountryImages.js
 * ─────────────────────────────────────────────────────────────
 * CLI: fetches Unsplash URLs into MongoDB `Country.imageUrl` (same query strategy as the API: name-first, like unsplash.com).
 *
 * Credentials: Admin → Settings → Unsplash Access Key (Mongo), or UNSPLASH_ACCESS_KEY in .env
 *
 *   node fetchCountryImages.js              → all countries (replaces imageUrl); trending rows first
 *   node fetchCountryImages.js --only-missing
 *   node fetchCountryImages.js --trending   → only featured / trending countries (`trending: true`)
 *   node fetchCountryImages.js --all        → explicit all
 *
 * @see server/services/unsplashCountryImages.js
 * ─────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const { resolveUnsplashAccessKey, processUnsplashCountryImageBatch } = require('./services/unsplashCountryImages');

async function run() {
  const onlyMissing = process.argv.includes('--only-missing');
  const onlyTrending = process.argv.includes('--trending');
  const explicitAll = process.argv.includes('--all');

  await connectDB();

  const accessKey = await resolveUnsplashAccessKey();
  if (!accessKey) {
    console.error('Unsplash Access Key is missing.');
    console.error(
      'Set it in Admin → Settings → Country images (Unsplash), or set UNSPLASH_ACCESS_KEY in server/.env',
    );
    console.error('Create an app at https://unsplash.com/oauth/applications and copy the Access Key.');
    process.exit(1);
  }

  if (onlyTrending) {
    console.log('Refreshing Unsplash images for featured / trending countries only (MongoDB trending: true).\n');
  } else if (!onlyMissing && !explicitAll) {
    console.log('Refreshing Unsplash images for all countries (trending first, then A–Z). Use --only-missing to skip filled rows. Use --trending for landing featured set only.\n');
  }

  const batchSize = Math.min(50, Math.max(1, parseInt(process.env.UNSPLASH_BATCH_SIZE || '25', 10) || 25));
  let skip = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let batchIndex = 0;

  for (;;) {
    batchIndex += 1;
    const r = await processUnsplashCountryImageBatch({ onlyMissing, onlyTrending, skip, limit: batchSize });
    if (!r.success) {
      console.error(r.message || 'Batch failed');
      process.exit(1);
    }
    totalUpdated += r.updated;
    totalFailed += r.failed;
    console.log(
      `Batch ${batchIndex}: skip=${r.skip} processed=${r.processed} updated=${r.updated} failed=${r.failed} (total matching=${r.totalMatching})`,
    );
    if (!r.hasMore) break;
    skip = r.nextSkip;
  }

  console.log(`\n✅ Done!  Updated: ${totalUpdated}  Not found / failed: ${totalFailed}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
