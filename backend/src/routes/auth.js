const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
  }

  if (!/^[A-Za-z]+$/.test(username)) {
    return res.status(400).json({ status: 'error', message: 'Username must contain letters only.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters.' });
  }

  const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
  if (!admin) {
    return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({ status: 'success', message: 'Login successful.', token });
});

router.post('/reset', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
  }

  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return res.status(400).json({ status: 'error', message: 'Username can only contain letters, numbers, and underscores.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters.' });
  }

  await Admin.deleteMany({});
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = new Admin({ username: username.toLowerCase().trim(), passwordHash });
  await admin.save();

  res.json({ status: 'success', message: 'Admin credentials reset successfully.' });
});

module.exports = router;
