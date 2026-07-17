const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authorization token missing.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.id).select('-passwordHash');

    if (!admin) {
      return res.status(401).json({ status: 'error', message: 'Invalid token.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
