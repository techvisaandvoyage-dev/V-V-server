const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(compression());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Public Config Routes
const {
  getRazorpayKeyId,
  getFirebaseConfig,
  getUploadSettings,
  getDestinationPageContent,
} = require('./controllers/settingsController');
app.get('/api/config/razorpay', getRazorpayKeyId);
app.get('/api/config/firebase', getFirebaseConfig);
app.get('/api/config/upload-settings', getUploadSettings);
app.get('/api/config/destination-content', getDestinationPageContent);

// Public Countries Routes
const { getCountries, getCountryBySlug } = require('./controllers/countryController');
const { getPublicPageBySlug, getPublicPages } = require('./controllers/staticPageController');
app.get('/api/countries', getCountries);
app.get('/api/countries/:slug', getCountryBySlug);
app.get('/api/pages', getPublicPages);
app.get('/api/pages/:slug', getPublicPageBySlug);

const { searchPlaces } = require('./controllers/geocodeController');
app.get('/api/geocode/places', searchPlaces);

// ✅ Simple test route (IMPORTANT)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // ── Seed default admin ───────────────────────────────────────
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await Admin.create({ email: 'admin@visa.com', password: hashedPassword });
      console.log('Default Admin account created: admin@visa.com');
    }
  } catch (err) {
    console.log('Skipping admin seed');
  }

  // ── Seed countries on first boot + keep list at 195 ───────────
  try {
    const { seedCountries, syncMissingCountries } = require('./seedCountries');
    await seedCountries();
    await syncMissingCountries();
  } catch (err) {
    console.log('Skipping country seed:', err.message);
  }
});
