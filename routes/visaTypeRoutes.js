const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  getAllVisaTypes,
  getActiveVisaTypes,
  createVisaType,
  updateVisaType,
  deleteVisaType,
} = require('../controllers/visaTypeController');

// Public/User route
router.get('/active', getActiveVisaTypes);

// Admin routes
router.get('/', protect, requireAdmin, getAllVisaTypes);
router.post('/', protect, requireAdmin, createVisaType);
router.patch('/:id', protect, requireAdmin, updateVisaType);
router.delete('/:id', protect, requireAdmin, deleteVisaType);

module.exports = router;
