const VisaType = require('../models/VisaType');

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
    const visaTypes = await VisaType.find({ active: true }).sort({ name: 1 });
    res.status(200).json({ success: true, visaTypes });
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

    const visaType = await VisaType.create({ name: trimmedName, active: active !== undefined ? active : true });
    res.status(201).json({ success: true, visaType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error creating visa type' });
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

    await visaType.save();
    res.status(200).json({ success: true, visaType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating visa type' });
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
