const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: { type: String, required: true, trim: true },
  flagEmoji: { type: String, default: '🌍' },
  basePrice: { type: Number, required: true, default: 0 },
  processingDays: { type: String, default: '5-10' },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard'],
    default: 'moderate',
  },
  visaType: { type: String, default: 'Tourist Visa' },
  continent: { type: String, default: 'Global' },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },

  /** Free-text visa requirements shown to the applicant */
  requirements: [{ type: String }],

  /**
   * Document types the applicant must upload for this country.
   * Supported keys: passport | idCard | dobCertificate | photo | bankStatement | travelInsurance
   */
  requiredDocuments: [{ type: String }],

  trending: { type: Boolean, default: false },
  successRate: { type: Number, default: 80, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Country', countrySchema);
