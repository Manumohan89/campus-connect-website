require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'supersecret' || jwtSecret.includes('REPLACE')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET is not set or is using a default value in production!');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using insecure JWT_SECRET in development. Set a strong secret in .env');
  }
}

module.exports = {
  port:       process.env.PORT       || 5000,
  jwtSecret:  jwtSecret              || 'dev-only-secret-change-in-production',
  dbUrl:      process.env.DATABASE_URL,
  nodeEnv:    process.env.NODE_ENV   || 'development',
  clientUrl:  process.env.CLIENT_URL || 'http://localhost:3000',
  emailUser:  process.env.EMAIL_USER,
  emailPass:  process.env.EMAIL_PASS,
  // File storage
  cloudinaryUrl:    process.env.CLOUDINARY_URL,
  cloudinaryName:   process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey:    process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
  // Coding platform
};
