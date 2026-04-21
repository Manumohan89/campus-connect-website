/**
 * validate.js — Input validation middleware
 * FIXED:
 *  1. fullName is now optional (step-2 field, user may skip)
 *  2. semester accepts both "Sem 1" format AND plain "1"
 *  3. yearScheme accepts both "2022 Scheme" format AND plain "2022"
 *  4. branch keeps original short codes
 */
const { body, validationResult } = require('express-validator');

function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map(rule => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  };
}

const SEMESTERS  = ['1','2','3','4','5','6','7','8',
                    'Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8',''];
const SCHEMES    = ['2025','2022','2021','2018','2015',
                    '2025 Scheme','2022 Scheme','2021 Scheme','2018 Scheme','2015 Scheme',''];
const BRANCHES   = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT',''];

const registerRules = [
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only'),
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters'),
  // fullName is optional — step-2 field
  body('fullName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Full name too long')
    .escape(),
  body('mobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid mobile number'),
  body('semester')
    .optional({ checkFalsy: true })
    .isIn(SEMESTERS).withMessage('Invalid semester'),
  body('branch')
    .optional({ checkFalsy: true })
    .isIn(BRANCHES).withMessage('Invalid branch'),
  body('yearScheme')
    .optional({ checkFalsy: true })
    .isIn(SCHEMES).withMessage('Invalid scheme'),
  body('college')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('College name too long')
    .escape(),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters'),
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
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).escape(),
  body('college').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).escape(),
  body('semester').optional({ checkFalsy: true }).isIn(SEMESTERS),
  body('branch').optional({ checkFalsy: true }).isIn(BRANCHES),
  body('mobile').optional({ checkFalsy: true }).matches(/^[0-9+\-\s]{7,15}$/),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).escape(),
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
