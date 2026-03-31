const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');
const pool = require('../db');
const nodemailer = require('nodemailer');
const { calculateSgpa, calculateCgpa } = require('../utils/sgpaCalculator');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { username, email, password, fullName, semester, college, mobile, branch, yearScheme } = req.body;

  try {
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: `The username '${username}' is already taken. Please choose a different username.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // OTP valid for 10 minutes

    await userModel.createUser({
      username,
      email,
      password: hashedPassword,
      fullName,
      semester,
      college,
      mobile,
      branch,
      yearScheme,
      otp,
      otp_expiry: otpExpiry,
    });

    // Try to send OTP email — if email is not configured, log it and continue
    let emailSent = true;
    try {
      await sendOTP(email, otp);
    } catch (emailErr) {
      emailSent = false;
      console.warn('⚠️  OTP email not sent (email credentials not configured):', emailErr.message);
      console.warn('   OTP for development/testing:', otp);
    }

    const devMode = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail_address@gmail.com';

    res.status(201).json({
      message: emailSent
        ? 'Registration successful. An OTP has been sent to your email.'
        : 'Registration successful. Email not configured — use OTP: 000000 to verify (dev mode).',
      devMode,
      devOtpHint: devMode ? 'Email not configured. Use 000000 as OTP to verify your account.' : null,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed due to an internal error.' });
  }
};

async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const storedPassword = user.password.toString();
    const isMatch = await bcrypt.compare(password, storedPassword);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Block check — admin can block a user account
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Contact admin.' });
    }

    // Email verification check — skip in dev mode if email not configured
    const devMode = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_gmail');
    if (!user.is_verified && !devMode) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        username: user.username
      });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, role: user.role || 'user' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
}

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      'SELECT full_name, semester, college, branch, sgpa, cgpa FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

async function updateUserProfile(req, res) {
  const { full_name, semester, college, mobile, branch, year_scheme } = req.body;

  try {
    await userModel.updateUserProfile(req.user.userId, {
      full_name,
      semester,
      college,
      mobile,
      branch,
      year_scheme,
    });
    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function emailTemplate(title, previewText, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1E1B4B,#4F46E5);padding:32px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">🎓</div>
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Campus Connect</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">VTU Student Portal</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:white;padding:36px 32px;">${bodyHtml}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Campus Connect · Free platform for VTU students</p>
        <p style="color:#9CA3AF;font-size:11px;margin:4px 0 0;">Bengaluru, Karnataka · support@campusconnect.in</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = emailTemplate('Verify your Campus Connect account', 'Your OTP code is inside',
      `<h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 12px;">Verify your email address</h2>
       <p style="color:#374151;line-height:1.7;margin:0 0 24px;">Thanks for registering on Campus Connect! Use the OTP below to verify your email and activate your account.</p>
       <div style="background:#EEF2FF;border:2px solid #C7D2FE;border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
         <p style="color:#4F46E5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px;">Your One-Time Password</p>
         <div style="font-size:42px;font-weight:900;font-family:monospace;color:#1E1B4B;letter-spacing:0.3em;line-height:1;">${otp}</div>
         <p style="color:#6B7280;font-size:13px;margin:12px 0 0;">⏱ This code expires in <strong>10 minutes</strong></p>
       </div>
       <div style="background:#FEF9C3;border-left:4px solid #F59E0B;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 24px;">
         <p style="color:#92400E;font-size:13px;margin:0;font-weight:600;">🔒 Security Notice</p>
         <p style="color:#78350F;font-size:13px;margin:4px 0 0;">Never share this OTP with anyone. Campus Connect will never ask for your OTP via phone or email.</p>
       </div>
       <p style="color:#9CA3AF;font-size:13px;margin:0;">If you did not create an account, you can safely ignore this email.</p>`
    );

    await transporter.sendMail({
      from: '"Campus Connect" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Verify your Campus Connect account — OTP inside',
      html,
      text: 'Your Campus Connect OTP is: ' + otp + '. Expires in 10 minutes.',
    });
    console.log('OTP sent to:', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

// Send OTP for login (password + OTP two-step flow)
const loginWithOTP = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fixed: was User.findOne() — method doesn't exist
    const user = await userModel.findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60000);

    // Persist OTP in database
    await pool.query(
      'UPDATE users SET otp = $1, otp_expiry = $2 WHERE user_id = $3',
      [otp, otpExpiry, user.user_id]
    );

    // Fixed: was sendOTPEmail (undefined) — correct function is sendOTP
    await sendOTP(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error in loginWithOTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP submitted by user
const verifyOTP = async (req, res) => {
  const { username, otp } = req.body;

  try {
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Dev bypass: accept '000000' as a master OTP when EMAIL_USER is not set
    const isDevBypass = !process.env.EMAIL_USER && otp === '000000';

    if (!isDevBypass && user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (!isDevBypass && new Date() > user.otp_expiry) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // Clear OTP
    await userModel.clearOTP(username);

    // Issue JWT so user is logged in after OTP verification
    const token = jwt.sign({ userId: user.user_id, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '7d' });

    res.status(200).json({ message: 'OTP verified successfully.', token, role: user.role || 'user' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyOTP,
  loginWithOTP,
  generateOTP,
  sendOTP,
};

// ── Email helper (reused for all notification emails) ────────────────────────
async function sendEmail(to, subject, html) {
  const devMode = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail_address@gmail.com';
  if (devMode) { console.log('📧 [DEV] Email to ' + to + ': ' + subject); return; }
  const transporter = require('nodemailer').createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  // Wrap bare HTML in the full email template if it doesn't have DOCTYPE
  const finalHtml = html.includes('<!DOCTYPE') ? html : emailTemplate(subject, '', html);
  await transporter.sendMail({
    from: '"Campus Connect" <' + process.env.EMAIL_USER + '>',
    to, subject, html: finalHtml,
  });
}

// POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const result = await require('../db').query('SELECT user_id, email, full_name FROM users WHERE email=$1', [email]);
    // Always respond success to prevent email enumeration
    if (!result.rows.length) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const user = result.rows[0];
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60000); // 1 hour
    const pool = require('../db');
    await pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.user_id, token, expires]);
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const resetHtml = '<h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 12px;">Reset your password</h2>' +
        '<p style="color:#374151;line-height:1.7;margin:0 0 24px;">Hi <strong>' + (user.full_name || 'Student') + '</strong>,</p>' +
        '<p style="color:#374151;line-height:1.7;margin:0 0 24px;">We received a request to reset your Campus Connect password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>' +
        '<div style="text-align:center;margin:0 0 24px;">' +
          '<a href="' + resetUrl + '" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">🔐 Reset My Password</a>' +
        '</div>' +
        '<div style="background:#F3F4F6;border-radius:10px;padding:14px 16px;margin:0 0 20px;">' +
          '<p style="color:#6B7280;font-size:12px;margin:0 0 4px;font-weight:700;">Or copy this link:</p>' +
          '<p style="color:#4F46E5;font-size:12px;margin:0;word-break:break-all;">' + resetUrl + '</p>' +
        '</div>' +
        '<div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0 8px 8px 0;padding:12px 16px;">' +
          '<p style="color:#991B1B;font-size:13px;margin:0;font-weight:600;">⚠ Didn\'t request this?</p>' +
          '<p style="color:#7F1D1D;font-size:13px;margin:4px 0 0;">If you didn\'t request a password reset, you can safely ignore this email. Your password will not be changed.</p>' +
        '</div>';
    await sendEmail(user.email, 'Reset your Campus Connect password', emailTemplate('Reset Password', 'Click to reset your password', resetHtml));
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/users/reset-password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token=$1 AND used=false AND expires_at > NOW()',
      [token]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired reset link.' });
    const resetToken = result.rows[0];
    const hashed = await require('bcryptjs').hash(password, 10);
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashed, resetToken.user_id]);
    await pool.query('UPDATE password_reset_tokens SET used=true WHERE id=$1', [resetToken.id]);
    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// POST /api/users/change-password (requires auth)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  try {
    const pool = require('../db');
    const result = await pool.query('SELECT password FROM users WHERE user_id=$1', [req.user.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const valid = await require('bcryptjs').compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hashed = await require('bcryptjs').hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashed, req.user.userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
module.exports.changePassword = changePassword;
module.exports.sendEmail = sendEmail;
