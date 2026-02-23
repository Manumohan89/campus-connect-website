const express = require('express');
const speakeasy = require('speakeasy');

const router = express.Router();

// Generate a secret for 2FA
router.get('/2fa/setup', (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  // Store this secret in the database and send it to the user
  res.json({ secret: secret.base32 });
});

// Verify TOTP
router.post('/2fa/verify', (req, res) => {
  const { token, secret } = req.body;
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allowable margin for error in seconds
  });

  if (verified) {
    res.status(200).send('2FA verified');
  } else {
    res.status(400).send('Invalid token');
  }
});

module.exports = router;
