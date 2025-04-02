const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Create slots
router.post('/slots', auth, isAdmin, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const slot = new Slot({ startTime, endTime });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all slots (including booked ones)
router.get('/slots', auth, isAdmin, async (req, res) => {
  try {
    const slots = await Slot.find().sort('startTime').populate('bookedBy', 'email');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a slot
router.delete('/slots/:id', auth, isAdmin, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;