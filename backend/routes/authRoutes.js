const express = require('express');
const router = express.Router();

// 2FA routes — speakeasy removed (not installed).
// To enable real 2FA: install speakeasy (`npm install speakeasy`)
// and uncomment the implementation below.

router.get('/2fa/setup', (req, res) => {
  res.status(501).json({ message: '2FA not yet implemented. Install speakeasy to enable.' });
});

router.post('/2fa/verify', (req, res) => {
  res.status(501).json({ message: '2FA not yet implemented. Install speakeasy to enable.' });
});

module.exports = router;
