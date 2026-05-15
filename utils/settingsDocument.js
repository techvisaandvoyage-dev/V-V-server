const Settings = require('../models/Settings');

const normalizeIncludedItem = (item) => {
  if (typeof item === 'string') {
    const title = String(item).trim();
    if (!title || title === '[object Object]') return null;
    return {
      title,
      description: '',
      icon: '',
      color: 'blue',
    };
  }

  const title = String(item?.title ?? '').trim();
  if (!title || title === '[object Object]') return null;

  return {
    title,
    description: String(item?.description ?? '').trim(),
    icon: String(item?.icon ?? '').trim(),
    color: String(item?.color ?? 'blue').trim() || 'blue',
  };
};

const normalizeFaq = (item) => {
  const question = String(item?.question ?? '').trim();
  const answer = String(item?.answer ?? '').trim();
  return question && answer ? { question, answer } : null;
};

const normalizeHowItWorks = (item) => {
  const title = String(item?.title ?? '').trim();
  const description = String(item?.description ?? '').trim();
  return title && description ? { title, description } : null;
};

const normalizeStringList = (list) =>
  Array.isArray(list)
    ? list.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];

const sanitizeSettingsPayload = (raw = {}) => ({
  destinationWhyBookNow: normalizeStringList(raw.destinationWhyBookNow),
  destinationIncludedItems: (Array.isArray(raw.destinationIncludedItems) ? raw.destinationIncludedItems : [])
    .map(normalizeIncludedItem)
    .filter(Boolean),
  destinationFaqs: (Array.isArray(raw.destinationFaqs) ? raw.destinationFaqs : [])
    .map(normalizeFaq)
    .filter(Boolean),
  destinationHowItWorks: (Array.isArray(raw.destinationHowItWorks) ? raw.destinationHowItWorks : [])
    .map(normalizeHowItWorks)
    .filter(Boolean),
  destinationVisaRequirements: normalizeStringList(raw.destinationVisaRequirements),
});

const loadSettingsDocument = async () => {
  try {
    let settings = await Settings.findOne({ singleton: 'global' });
    if (!settings) {
      settings = await Settings.create({ singleton: 'global' });
    }
    return settings;
  } catch (error) {
    const raw = await Settings.collection.findOne({ singleton: 'global' });
    if (!raw) {
      return Settings.create({ singleton: 'global' });
    }

    const healed = sanitizeSettingsPayload(raw);
    await Settings.collection.updateOne(
      { _id: raw._id },
      { $set: healed }
    );

    return Settings.findById(raw._id);
  }
};

module.exports = {
  loadSettingsDocument,
  sanitizeSettingsPayload,
};
