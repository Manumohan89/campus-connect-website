/**
 * validate.js — Reusable input validation middleware using express-validator
 * Usage: router.post('/route', validate(rules), handler)
 */
const { body, param, query, validationResult } = require('express-validator');

// Middleware that returns errors if validation fails
function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map(rule => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.path, message: e.msg }))
      });
    }
    next();
  };
}

// ── Rule sets ────────────────────────────────────────────────────────────────

const registerRules = [
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores')
    .escape(),
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be 6–128 characters'),
  body('fullName')
    .trim().notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name too long')
    .escape(),
  body('mobile')
    .optional()
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid mobile number'),
  body('semester')
    .optional()
    .isIn(['1','2','3','4','5','6','7','8']).withMessage('Invalid semester'),
  body('branch')
    .optional()
    .isIn(['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT','']).withMessage('Invalid branch'),
  body('yearScheme')
    .optional()
    .isIn(['2025','2022','2021','2018','2015','']).withMessage('Invalid scheme'),
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required').escape(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be 6–128 characters'),
];

const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).escape(),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).escape(),
];

const notificationRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).escape(),
  body('body').trim().notEmpty().withMessage('Body is required').isLength({ max: 1000 }).escape(),
  body('type').optional().isIn(['announcement','placement','backlog','marks','resource','attendance']),
  body('target').optional().isIn(['all','branch']),
];

const profileUpdateRules = [
  body('fullName').optional().trim().isLength({ max: 100 }).escape(),
  body('college').optional().trim().isLength({ max: 200 }).escape(),
  body('semester').optional().isIn(['1','2','3','4','5','6','7','8','']),
  body('branch').optional().isIn(['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT','']),
  body('mobile').optional().matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid mobile'),
  body('bio').optional().trim().isLength({ max: 500 }).escape(),
];

const problemRules = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }).escape(),
  body('description').trim().notEmpty().withMessage('Description required').isLength({ max: 10000 }),
  body('difficulty').isIn(['easy','medium','hard']).withMessage('Invalid difficulty'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  contactRules,
  notificationRules,
  profileUpdateRules,
  problemRules,
};
