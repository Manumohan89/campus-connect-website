require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'supersecret' || jwtSecret.includes('REPLACE')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET is not set or using default value in production!');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using insecure JWT_SECRET in development.');
  }
}

// Parse allowed origins — supports comma-separated list in CLIENT_URL
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

module.exports = {
  port:       process.env.PORT        || 5000,
  jwtSecret:  jwtSecret               || 'dev-only-secret-change-in-production',
  dbUrl:      process.env.DATABASE_URL,
  nodeEnv:    process.env.NODE_ENV    || 'development',
  allowedOrigins,
  clientUrl:  allowedOrigins[0],      // kept for backward compat
  emailUser:  process.env.EMAIL_USER,
  emailPass:  process.env.EMAIL_PASS,
  cloudinaryUrl:    process.env.CLOUDINARY_URL,
  cloudinaryName:   process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey:    process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
};
