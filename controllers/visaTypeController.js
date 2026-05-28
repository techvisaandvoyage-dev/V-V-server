const VisaType = require('../models/VisaType');
const Country = require('../models/Country');

const normalizeCountryIds = (values) =>
  Array.isArray(values)
    ? Array.from(new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean)))
    : [];

const resolveVisaTypeVisibility = async ({ applyToAllActiveCountries, selectedCountries }) => {
  const activeCountries = await Country.find({ isActive: { $ne: false } }).select('_id slug').lean();
  const activeIds = new Set(
    activeCountries.flatMap((country) => [country?._id, country?.slug].map((value) => String(value ?? '').trim()).filter(Boolean))
  );
  const normalizedSelected = normalizeCountryIds(selectedCountries).filter((id) => activeIds.has(id));
  const applyAll = applyToAllActiveCountries !== false;

  if (!applyAll && normalizedSelected.length === 0) {
    const error = new Error('Please select at least one country.');
    error.statusCode = 400;
    throw error;
  }

  return {
    applyToAllActiveCountries: applyAll,
    selectedCountries: applyAll ? [] : normalizedSelected,
  };
};

const matchesCountry = (visaType, countryId) => {
  if (visaType?.applyToAllActiveCountries !== false) return true;
  const selected = normalizeCountryIds(visaType?.selectedCountries);
  return selected.includes(String(countryId ?? '').trim());
};

exports.getAllVisaTypes = async (req, res) => {
  try {
    const visaTypes = await VisaType.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, visaTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching visa types' });
  }
};

exports.getActiveVisaTypes = async (req, res) => {
  try {
    const requestedCountryId = String(req.query?.countryId ?? '').trim();
    const visaTypes = await VisaType.find({ active: true }).sort({ name: 1 });
    const filtered = requestedCountryId
      ? visaTypes.filter((visaType) => matchesCountry(visaType, requestedCountryId))
      : visaTypes;
    res.status(200).json({ success: true, visaTypes: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching active visa types' });
  }
};

exports.createVisaType = async (req, res) => {
  try {
    const { name, active } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Visa type name is required' });
    }

    const trimmedName = name.trim();
    const existing = await VisaType.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Visa type already exists' });
    }

    const visibility = await resolveVisaTypeVisibility(req.body || {});
    const visaType = await VisaType.create({
      name: trimmedName,
      active: active !== undefined ? active : true,
      ...visibility,
    });
    res.status(201).json({ success: true, visaType });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error creating visa type' });
  }
};

exports.updateVisaType = async (req, res) => {
  try {
    const { name, active } = req.body;
    const visaType = await VisaType.findById(req.params.id);
    
    if (!visaType) {
      return res.status(404).json({ success: false, message: 'Visa type not found' });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName === '') {
        return res.status(400).json({ success: false, message: 'Visa type name cannot be empty' });
      }
      const existing = await VisaType.findOne({ 
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another visa type with this name already exists' });
      }
      visaType.name = trimmedName;
    }

    if (active !== undefined) {
      visaType.active = active;
    }

    if (req.body?.applyToAllActiveCountries !== undefined || req.body?.selectedCountries !== undefined) {
      const visibility = await resolveVisaTypeVisibility(req.body || {});
      visaType.applyToAllActiveCountries = visibility.applyToAllActiveCountries;
      visaType.selectedCountries = visibility.selectedCountries;
    }

    await visaType.save();
    res.status(200).json({ success: true, visaType });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error updating visa type' });
  }
};

exports.deleteVisaType = async (req, res) => {
  try {
    const visaType = await VisaType.findById(req.params.id);
    if (!visaType) {
      return res.status(404).json({ success: false, message: 'Visa type not found' });
    }
    
    await visaType.deleteOne();
    res.status(200).json({ success: true, message: 'Visa type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting visa type' });
  }
};
