const mongoose = require('mongoose');

const visaTypeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Visa type name is required'], 
    unique: true, 
    trim: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  applyToAllActiveCountries: {
    type: Boolean,
    default: true,
  },
  selectedCountries: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

module.exports = mongoose.model('VisaType', visaTypeSchema);
