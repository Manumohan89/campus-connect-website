const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * isAdmin middleware
 * Must be used AFTER authMiddleware (which sets req.user)
 * Returns 403 if the token's role is not 'admin'
 */
function isAdmin(req, res, next) {
  // authMiddleware already verified the JWT and set req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized — no session' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }
  next();
}

module.exports = isAdmin;
