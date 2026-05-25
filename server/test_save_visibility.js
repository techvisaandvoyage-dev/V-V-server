const mongoose = require('mongoose');
const Settings = require('./models/Settings');

const MONGO_URI = "mongodb+srv://Yash:dYQS9imycdkqhBc0@cluster0.wp8rmxv.mongodb.net/VisaandvoyageDB";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const settings = await Settings.findOne({});
    if (!settings) {
      console.log("No settings found");
      process.exit(1);
    }

    console.log("Before: Overrides count:", settings.documentCatalogOverrides.length);
    
    // Let's try to set 'photo' to deleted = true
    const key = 'photo';
    const idx = settings.documentCatalogOverrides.findIndex((d) => d.key === key);
    if (idx >= 0) {
      console.log("Found photo override before:", settings.documentCatalogOverrides[idx]);
      settings.documentCatalogOverrides[idx].deleted = true;
    } else {
      settings.documentCatalogOverrides.push({ key, deleted: true });
    }

    settings.markModified('documentCatalogOverrides');
    await settings.save();

    // Fetch again from DB to verify persistence
    const refreshed = await Settings.findOne({});
    const refreshedIdx = refreshed.documentCatalogOverrides.findIndex((d) => d.key === key);
    console.log("After: Refreshed photo override:", refreshed.documentCatalogOverrides[refreshedIdx]);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
