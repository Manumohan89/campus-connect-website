const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db');

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized — no token provided' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    // Check if user is blocked (async — only for non-health routes)
    if (req.path !== '/health') {
      try {
        const result = await pool.query(
          'SELECT is_blocked, role FROM users WHERE user_id = $1',
          [decoded.userId]
        );
        if (!result.rows.length) return res.status(401).json({ error: 'User not found' });
        if (result.rows[0].is_blocked) return res.status(403).json({ error: 'Account suspended. Contact support.' });
        // Sync latest role (handles role upgrades/downgrades without re-login)
        req.user.role = result.rows[0].role;
      } catch (dbErr) {
        console.error('❌ AuthMiddleware DB error:', dbErr.message);
        return res.status(503).json({ error: 'Database temporarily unavailable' });
      }
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired — please log in again' });
    console.error('❌ AuthMiddleware JWT error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
