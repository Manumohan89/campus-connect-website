const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');
const pool = require('../db');
const nodemailer = require('nodemailer');
const { calculateCgpa } = require('../utils/sgpaCalculator');
require('dotenv').config();

// ── Cinematic email template ──────────────────────────────────────────────────
function emailTemplate(title, previewText, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
      <tr><td style="background:linear-gradient(135deg,#1E1B4B 0%,#4F46E5 60%,#7C3AED 100%);padding:36px;text-align:center;">
        <div style="font-size:40px;margin-bottom:10px;">🎓</div>
        <h1 style="color:white;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Campus Connect</h1>
        <p style="color:rgba(255,255,255,0.65);margin:6px 0 0;font-size:13px;letter-spacing:0.05em;">VTU Student Portal · Bengaluru</p>
      </td></tr>
      <tr><td style="background:white;padding:40px 36px;">${bodyHtml}</td></tr>
      <tr><td style="background:#F9FAFB;padding:22px 36px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Campus Connect · Free platform for VTU students</p>
        <p style="color:#9CA3AF;font-size:11px;margin:4px 0 0;">Bengaluru, Karnataka · This email was sent from a no-reply address</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Nodemailer transporter (Gmail SMTP — works on Render free tier) ────────────
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || user.includes('your_gmail') || user === '') return null;
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // needed on some Render regions
  });
}

// ── Send any email ────────────────────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧 [DEV - no SMTP] Email to ${to}: ${subject}`);
    return { devMode: true };
  }
  await transporter.sendMail({
    from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
    to, subject, html,
    text: subject, // plain-text fallback
  });
  console.log(`✅ Email sent to ${to}`);
}

// ── OTP email (cinematic design) ──────────────────────────────────────────────
async function sendOTP(email, otp) {
  const bodyHtml = `
    <h2 style="color:#111827;font-size:22px;font-weight:900;margin:0 0 14px;letter-spacing:-0.3px;">Verify your email</h2>
    <p style="color:#374151;line-height:1.75;margin:0 0 28px;font-size:15px;">
      Welcome to <strong>Campus Connect</strong>! You're one step away from joining thousands of VTU students.
      Use the code below to verify your email address.
    </p>
    <div style="background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border:2px solid #C7D2FE;border-radius:18px;padding:32px;text-align:center;margin:0 0 28px;">
      <p style="color:#4F46E5;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 16px;">Your Verification Code</p>
      <div style="font-size:52px;font-weight:900;font-family:'Courier New',monospace;color:#1E1B4B;letter-spacing:0.4em;line-height:1;">${otp}</div>
      <p style="color:#6B7280;font-size:13px;margin:16px 0 0;">⏱ Expires in <strong>10 minutes</strong></p>
    </div>
    <div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:0 12px 12px 0;padding:14px 18px;margin:0 0 24px;">
      <p style="color:#92400E;font-size:13px;margin:0;font-weight:700;">🔒 Security Notice</p>
      <p style="color:#78350F;font-size:13px;margin:6px 0 0;">Never share this code. Campus Connect will never ask for your OTP via call or chat.</p>
    </div>
    <p style="color:#9CA3AF;font-size:13px;margin:0;">Didn't create an account? You can safely ignore this email.</p>`;
  await sendEmail(email, '🎓 Verify your Campus Connect account — OTP inside',
    emailTemplate('Verify Email', 'Your OTP code is inside', bodyHtml));
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/users/register ──────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { username, email, password, fullName, semester, college, mobile, branch, yearScheme } = req.body;
  try {
    // Check duplicate username
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) return res.status(400).json({ message: `Username '${username}' is already taken.` });

    // Check duplicate email
    const existingEmail = await pool.query('SELECT user_id FROM users WHERE email=$1', [email]);
    if (existingEmail.rows.length) return res.status(400).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 min

    const transporter = createTransporter();
    const emailConfigured = !!transporter;

    // Create user — not verified yet if email is configured; auto-verified in dev mode
    await pool.query(
      `INSERT INTO users (username, email, password, full_name, semester, college, mobile, branch, year_scheme, is_verified, otp, otp_expiry, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'user')`,
      [username, email, hashedPassword, fullName || null, semester || null,
       college || null, mobile || null, branch || null, yearScheme || null,
       !emailConfigured, // auto-verify only when no email configured (dev mode)
       otp, otpExpiry]
    );

    if (emailConfigured) {
      try {
        await sendOTP(email, otp);
        return res.status(201).json({
          message: 'Account created! Check your email for the 6-digit verification OTP.',
          requiresOtp: true,
          username,
        });
      } catch (emailErr) {
        console.error('OTP email failed:', emailErr.message);
        // Email failed — auto-verify so user isn't stuck
        await pool.query('UPDATE users SET is_verified=true WHERE username=$1', [username]);
        return res.status(201).json({
          message: 'Account created! Email sending failed — you can log in directly.',
          requiresOtp: false,
          username,
        });
      }
    } else {
      // Dev mode — no email configured
      return res.status(201).json({
        message: 'Account created (dev mode — OTP skipped).',
        requiresOtp: false,
        devMode: true,
        devOtp: otp,
        username,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

// ── POST /api/users/verify-otp ────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { username, otp } = req.body;
  try {
    const user = await userModel.findUserByUsername(username);
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (user.is_verified) return res.status(400).json({ message: 'Account already verified.' });

    const devBypass = !createTransporter() && otp === '000000';

    if (!devBypass && String(user.otp) !== String(otp)) return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    if (!devBypass && new Date() > new Date(user.otp_expiry)) return res.status(400).json({ message: 'OTP has expired. Please register again.' });

    await pool.query('UPDATE users SET is_verified=true, otp=NULL, otp_expiry=NULL WHERE username=$1', [username]);

    const token = jwt.sign({ userId: user.user_id, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ message: 'Email verified! Welcome to Campus Connect.', token, role: user.role || 'user' });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Verification failed.' });
  }
};

// ── POST /api/users/resend-otp ────────────────────────────────────────────────
// (route already exists in userRoutes — this is a second path via controller)

// ── POST /api/users/login — now accepts email OR username ─────────────────────
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  try {
    // Accept both email and username in the same field
    const isEmail = email.includes('@');
    const query = isEmail
      ? 'SELECT * FROM users WHERE email=$1'
      : 'SELECT * FROM users WHERE username=$1';
    const result = await pool.query(query, [isEmail ? email.toLowerCase().trim() : email.trim()]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'No account found with that email. Please check or register.' });
    const isMatch = await bcrypt.compare(password, user.password.toString());
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password. Please try again.' });
    if (user.is_blocked) return res.status(403).json({ error: 'Your account has been blocked. Contact admin.' });
    if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email first. Check your inbox for the OTP.', requiresOtp: true, username: user.username });

    const token = jwt.sign({ userId: user.user_id, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, role: user.role || 'user' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
}

const getUserProfile = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT full_name, semester, college, branch, sgpa, cgpa FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

async function updateUserProfile(req, res) {
  const { full_name, semester, college, mobile, branch, year_scheme } = req.body;
  try {
    await userModel.updateUserProfile(req.user.userId, { full_name, semester, college, mobile, branch, year_scheme });
    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// ── POST /api/users/forgot-password ──────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const result = await pool.query('SELECT user_id, email, full_name FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    if (!result.rows.length) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const user = result.rows[0];
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60000);
    await pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.user_id, token, expires]);
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    const bodyHtml = `
      <h2 style="color:#111827;font-size:22px;font-weight:900;margin:0 0 14px;">Reset your password</h2>
      <p style="color:#374151;line-height:1.75;margin:0 0 24px;font-size:15px;">Hi <strong>${user.full_name || 'Student'}</strong>, we received a request to reset your Campus Connect password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:0 0 28px;">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;padding:16px 40px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.01em;">🔐 Reset My Password</a>
      </div>
      <div style="background:#F3F4F6;border-radius:12px;padding:14px 18px;margin:0 0 20px;">
        <p style="color:#6B7280;font-size:12px;margin:0 0 4px;font-weight:700;">Or copy this link:</p>
        <p style="color:#4F46E5;font-size:12px;margin:0;word-break:break-all;">${resetUrl}</p>
      </div>
      <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0 12px 12px 0;padding:14px 18px;">
        <p style="color:#991B1B;font-size:13px;margin:0;font-weight:700;">⚠ Didn't request this?</p>
        <p style="color:#7F1D1D;font-size:13px;margin:6px 0 0;">If you didn't request a reset, ignore this email. Your password won't change.</p>
      </div>`;
    await sendEmail(user.email, '🔐 Reset your Campus Connect password', emailTemplate('Reset Password', 'Click to reset your password', bodyHtml));
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token=$1 AND used=false AND expires_at > NOW()', [token]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired reset link.' });
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashed, result.rows[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used=true WHERE id=$1', [result.rows[0].id]);
    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  try {
    const result = await pool.query('SELECT password FROM users WHERE user_id=$1', [req.user.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashed, req.user.userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const loginWithOTP = async (req, res) => res.status(410).json({ error: 'This endpoint is deprecated. Use /login.' });

module.exports = {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  verifyOTP, loginWithOTP, generateOTP, sendOTP, sendEmail,
  forgotPassword, resetPassword, changePassword,
};
