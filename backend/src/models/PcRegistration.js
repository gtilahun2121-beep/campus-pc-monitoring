const mongoose = require('mongoose');

const pcRegistrationSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true, unique: true },
  studentName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  pcBrand: { type: String, required: true, trim: true },
  serialNumber: { type: String, required: true, trim: true, unique: true },
  status: { type: String, enum: ['Inside Campus', 'Outside Campus'], default: 'Outside Campus' },
  lastEntry: { type: Date, default: null },
  lastExit: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.models.PcRegistration || mongoose.model('PcRegistration', pcRegistrationSchema);
