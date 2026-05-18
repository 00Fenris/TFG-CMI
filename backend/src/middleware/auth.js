require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    // Attach user to request
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error', err.name, err.message);
    // Differentiate expired tokens vs invalid tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication error' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
