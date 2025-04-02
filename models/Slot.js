const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster querying
slotSchema.index({ startTime: 1, bookedBy: 1 });

module.exports = mongoose.model('Slot', slotSchema);