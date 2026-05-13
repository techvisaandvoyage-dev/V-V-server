const Settings = require('../models/Settings');

/** Strip secret JSON from admin API; expose whether server env supplies the Admin SDK key. */
const sanitizeSettingsForAdminResponse = (doc) => {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  delete o.firebaseServiceAccountJson;
  o.firebaseAdminFromEnv = Boolean(String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim());
  return o;
};

const DESTINATION_INCLUDED_FALLBACK = [
  'Application form guidance',
  'Document checklist and validation',
  'End-to-end support till submission',
];

const DESTINATION_FAQS_FALLBACK = [
  {
    question: 'How long does processing take?',
    answer:
      'Typical processing varies by destination — each country page lists estimated timelines based on current embassy guidance.',
  },
  {
    question: 'Can I track my application?',
    answer: 'Yes, you can track status updates from your user dashboard after applying.',
  },
  {
    question: 'Is this fee refundable?',
    answer: 'Government and service fees depend on visa policy and review stage.',
  },
];

/**
 * Admin saves one settings card at a time. The client always sends keys for that card;
 * password inputs often arrive as "" even though Mongo already has the secret (browser
 * state, tab order, or a refetch race). Never wipe an existing stored value when the
 * incoming trimmed string is empty — only a non-empty value replaces it.
 * @param {Record<string, unknown>} doc
 * @param {string} path
 * @param {unknown} incoming
 */
const assignSecretUnlessEmpty = (doc, path, incoming) => {
  if (incoming === undefined) return;
  const next = String(incoming ?? '').trim();
  if (next) doc[path] = next;
};

/**
 * @route   GET /api/admin/settings
 * @desc    Get global settings (Admin only)
 * @access  Private (Admin)
 */
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: 'global' });
    if (!settings) {
      settings = await Settings.create({ singleton: 'global' });
    }
    res.json({ success: true, settings: sanitizeSettingsForAdminResponse(settings) });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

/**
 * @route   PUT /api/admin/settings
 * @desc    Update global settings (Admin only)
 * @access  Private (Admin)
 */
const updateSettings = async (req, res) => {
  try {
    const {
      razorpayKeyId,
      razorpayKeySecret,
      firebaseApiKey,
      firebaseAuthDomain,
      firebaseProjectId,
      googleClientId,
      googleClientSecret,
      firebaseStorageBucket,
      firebaseMessagingSenderId,
      firebaseAppId,
      sms91AuthKey,
      sms91TemplateId,
      sms91OtpLength,
      smtpEmailUser,
      smtpEmailPass,
      smtpEmailService,
      enableGDriveUpload,
      enableFileUpload,
      unsplashAccessKey,
      unsplashSecretKey,
      unsplashApplicationId,
      destinationIncludedItems,
      destinationFaqs,
    } = req.body;
    console.log('Admin updating settings:', {
      razorpayKeyId,
      razorpayKeySecret: razorpayKeySecret ? '***' : '',
      firebaseProjectId,
      googleClientId,
      googleClientSecret: googleClientSecret ? '***' : '',
      firebaseApiKey: firebaseApiKey ? '***' : '',
      sms91AuthKey: sms91AuthKey ? '***' : '',
      sms91TemplateId,
      unsplashAccessKey: unsplashAccessKey ? '***' : '',
      unsplashSecretKey: unsplashSecretKey ? '***' : '',
      unsplashApplicationId: unsplashApplicationId || ''
    });
    
    let settings = await Settings.findOne({ singleton: 'global' });
    if (!settings) {
      console.log('Creating global settings singleton...');
      settings = await Settings.create({ singleton: 'global' });
    }
    
    if (razorpayKeyId !== undefined) settings.razorpayKeyId = String(razorpayKeyId || '').trim();
    assignSecretUnlessEmpty(settings, 'razorpayKeySecret', razorpayKeySecret);
    assignSecretUnlessEmpty(settings, 'firebaseApiKey', firebaseApiKey);
    if (firebaseAuthDomain !== undefined) settings.firebaseAuthDomain = String(firebaseAuthDomain || '').trim();
    if (firebaseProjectId !== undefined) settings.firebaseProjectId = String(firebaseProjectId || '').trim();
    if (googleClientId !== undefined) settings.googleClientId = String(googleClientId || '').trim();
    assignSecretUnlessEmpty(settings, 'googleClientSecret', googleClientSecret);
    if (firebaseStorageBucket !== undefined) settings.firebaseStorageBucket = String(firebaseStorageBucket || '').trim();
    if (firebaseMessagingSenderId !== undefined) settings.firebaseMessagingSenderId = String(firebaseMessagingSenderId || '').trim();
    assignSecretUnlessEmpty(settings, 'firebaseAppId', firebaseAppId);
    assignSecretUnlessEmpty(settings, 'sms91AuthKey', sms91AuthKey);
    assignSecretUnlessEmpty(settings, 'sms91TemplateId', sms91TemplateId);
    if (sms91OtpLength !== undefined) {
      const normalizedOtpLength = String(sms91OtpLength || '6').trim();
      settings.sms91OtpLength = ['4', '6'].includes(normalizedOtpLength) ? normalizedOtpLength : '6';
    }
    if (smtpEmailUser !== undefined) settings.smtpEmailUser = String(smtpEmailUser || '').trim();
    assignSecretUnlessEmpty(settings, 'smtpEmailPass', smtpEmailPass);
    if (smtpEmailService !== undefined) {
      settings.smtpEmailService = String(smtpEmailService || '').trim();
    }
    if (enableGDriveUpload !== undefined) settings.enableGDriveUpload = Boolean(enableGDriveUpload);
    if (enableFileUpload !== undefined) settings.enableFileUpload = Boolean(enableFileUpload);
    assignSecretUnlessEmpty(settings, 'unsplashAccessKey', unsplashAccessKey);
    assignSecretUnlessEmpty(settings, 'unsplashSecretKey', unsplashSecretKey);
    if (unsplashApplicationId !== undefined) settings.unsplashApplicationId = String(unsplashApplicationId || '').trim();

    if (destinationIncludedItems !== undefined) {
      settings.destinationIncludedItems = Array.isArray(destinationIncludedItems)
        ? destinationIncludedItems.map((s) => String(s ?? '').trim()).filter(Boolean)
        : [];
    }
    if (destinationFaqs !== undefined) {
      settings.destinationFaqs = Array.isArray(destinationFaqs)
        ? destinationFaqs
            .map((f) => ({
              question: String(f?.question ?? '').trim(),
              answer: String(f?.answer ?? '').trim(),
            }))
            .filter((f) => f.question && f.answer)
        : [];
    }

    await settings.save();
    console.log('Settings updated successfully');
    res.json({
      success: true,
      settings: sanitizeSettingsForAdminResponse(settings),
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating settings' });
  }
};

/**
 * @route   GET /api/config/razorpay
 * @desc    Get public Razorpay Key ID (Public/User)
 * @access  Public
 */
const getRazorpayKeyId = async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'global' });
    const keyIdFromSettings = String(settings?.razorpayKeyId || '').trim();
    const keyIdFromEnv = String(process.env.RAZORPAY_KEY_ID || '').trim();
    const keyId = keyIdFromSettings || keyIdFromEnv;

    if (!keyId) {
      return res.json({ success: false, message: 'Razorpay keys not configured' });
    }
    res.json({ success: true, keyId });
  } catch (error) {
    console.error('Error fetching Razorpay Key ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/config/firebase
 * @desc    Get public Firebase web config for the client app
 * @access  Public
 */
const getFirebaseConfig = async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'global' });
    const config = {
      apiKey: String(settings?.firebaseApiKey || process.env.FIREBASE_API_KEY || '').trim(),
      authDomain: String(settings?.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN || '').trim(),
      projectId: String(settings?.firebaseProjectId || process.env.FIREBASE_PROJECT_ID || '').trim(),
      googleClientId: String(settings?.googleClientId || process.env.GOOGLE_CLIENT_ID || '').trim(),
      storageBucket: String(settings?.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET || '').trim(),
      messagingSenderId: String(settings?.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID || '').trim(),
      appId: String(settings?.firebaseAppId || process.env.FIREBASE_APP_ID || '').trim(),
    };

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      return res.json({ success: false, message: 'Firebase is not configured' });
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/config/upload-settings
 * @desc    Get public document upload settings (Public/User)
 * @access  Public
 */
const getUploadSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'global' });
    const config = {
      enableGDriveUpload: settings?.enableGDriveUpload !== false,
      enableFileUpload: settings?.enableFileUpload !== false,
    };
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching upload settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/config/destination-content
 * @desc    Global "What's included" + FAQs for all destination detail pages
 * @access  Public
 */
const getDestinationPageContent = async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'global' });
    const rawInc = settings?.destinationIncludedItems;
    const included =
      Array.isArray(rawInc) && rawInc.length
        ? rawInc.map((s) => String(s ?? '').trim()).filter(Boolean)
        : DESTINATION_INCLUDED_FALLBACK;
    const rawFaqs = settings?.destinationFaqs;
    const faqs =
      Array.isArray(rawFaqs) && rawFaqs.length
        ? rawFaqs
            .map((f) => ({
              question: String(f?.question ?? '').trim(),
              answer: String(f?.answer ?? '').trim(),
            }))
            .filter((f) => f.question && f.answer)
        : DESTINATION_FAQS_FALLBACK;
    res.json({ success: true, config: { included, faqs } });
  } catch (error) {
    console.error('Error fetching destination page content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getRazorpayKeyId,
  getFirebaseConfig,
  getUploadSettings,
  getDestinationPageContent,
};
