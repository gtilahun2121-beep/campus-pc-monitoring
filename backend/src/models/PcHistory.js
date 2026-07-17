const mongoose = require('mongoose');

const pcHistorySchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  serialNumber: { type: String, required: true, trim: true },
  entryTime: { type: Date, default: null },
  exitTime: { type: Date, default: null },
  status: { type: String, enum: ['Inside Campus', 'Outside Campus'], required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.models.PcHistory || mongoose.model('PcHistory', pcHistorySchema);
