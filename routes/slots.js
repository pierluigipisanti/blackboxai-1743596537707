const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const auth = require('../middleware/auth');

// Get available slots
router.get('/', auth, async (req, res) => {
  try {
    const slots = await Slot.find({ 
      bookedBy: null,
      startTime: { $gte: new Date() }
    }).sort('startTime');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Book a slot
router.post('/:id/book', auth, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.bookedBy) return res.status(400).json({ message: 'Slot already booked' });

    slot.bookedBy = req.user.id;
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;