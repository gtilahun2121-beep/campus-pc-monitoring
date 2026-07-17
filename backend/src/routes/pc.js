const express = require('express');
const authMiddleware = require('../middleware/auth');
const PcRegistration = require('../models/PcRegistration');
const PcHistory = require('../models/PcHistory');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { studentId, studentName, department, pcBrand, serialNumber } = req.body;

  if (!studentId || !studentName || !department || !pcBrand || !serialNumber) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  if (!/^[0-9]+$/.test(studentId)) {
    return res.status(400).json({ status: 'error', message: 'Student ID must contain only numbers.' });
  }
  if (!/^[A-Za-z ]+$/.test(studentName)) {
    return res.status(400).json({ status: 'error', message: 'Student Name must contain only letters.' });
  }
  if (!/^[A-Za-z ]+$/.test(department)) {
    return res.status(400).json({ status: 'error', message: 'Department must contain only letters.' });
  }
  if (!/^[A-Za-z ]+$/.test(pcBrand)) {
    return res.status(400).json({ status: 'error', message: 'PC Brand must contain only letters.' });
  }
  if (!/^[A-Za-z0-9]+$/.test(serialNumber)) {
    return res.status(400).json({ status: 'error', message: 'Serial Number must contain only letters and numbers.' });
  }

  const existing = await PcRegistration.findOne({ $or: [
    { studentId },
    { serialNumber },
  ] });

  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Student ID or Serial Number is already registered.' });
  }

  const registration = new PcRegistration({
    studentId,
    studentName,
    department,
    pcBrand,
    serialNumber,
  });

  await registration.save();
  res.json({ status: 'success', message: 'PC registered successfully.' });
});

router.get('/search', authMiddleware, async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({ status: 'error', message: 'Search term is required.' });
  }

  const regex = new RegExp(searchTerm.trim(), 'i');
  const results = await PcRegistration.find({
    $or: [
      { studentId: regex },
      { studentName: regex },
    ],
  }).sort({ studentName: 1 });

  res.json({ status: 'success', data: results });
});

router.post('/entry', authMiddleware, async (req, res) => {
  const { serialNumber } = req.body;

  if (!serialNumber) {
    return res.status(400).json({ status: 'error', message: 'Serial number is required.' });
  }

  const registration = await PcRegistration.findOne({ serialNumber });
  if (!registration) {
    return res.status(404).json({ status: 'error', message: 'PC not registered.' });
  }
  if (registration.status === 'Inside Campus') {
    return res.status(400).json({ status: 'error', message: 'PC is already recorded as inside the campus.' });
  }

  registration.status = 'Inside Campus';
  registration.lastEntry = new Date();
  await registration.save();

  const history = new PcHistory({
    studentId: registration.studentId,
    serialNumber,
    entryTime: new Date(),
    status: 'Inside Campus',
  });
  await history.save();

  res.json({ status: 'success', message: 'Entry recorded successfully.' });
});

router.post('/exit', authMiddleware, async (req, res) => {
  const { serialNumber } = req.body;

  if (!serialNumber) {
    return res.status(400).json({ status: 'error', message: 'Serial number is required.' });
  }

  const registration = await PcRegistration.findOne({ serialNumber });
  if (!registration) {
    return res.status(404).json({ status: 'error', message: 'PC not registered.' });
  }
  if (registration.status === 'Outside Campus') {
    return res.status(400).json({ status: 'error', message: 'PC is already recorded as outside the campus.' });
  }

  registration.status = 'Outside Campus';
  registration.lastExit = new Date();
  await registration.save();

  const history = await PcHistory.findOne({ serialNumber, exitTime: null }).sort({ entryTime: -1 });
  if (history) {
    history.exitTime = new Date();
    history.status = 'Outside Campus';
    await history.save();
  }

  res.json({ status: 'success', message: 'Exit recorded successfully.' });
});

router.get('/history', authMiddleware, async (req, res) => {
  const { studentId } = req.query;
  const filter = {};

  if (studentId) {
    filter.studentId = studentId;
  }

  const history = await PcHistory.find(filter).sort({ entryTime: -1 });
  res.json({ status: 'success', data: history });
});

module.exports = router;
