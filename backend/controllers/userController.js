const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const userModel = require('../models/userModel');
const { calculateSgpa, calculateCgpa } = require('../utils/sgpaCalculator');

// Register user
const registerUser = async (req, res) => {
  const { username, password, fullName, semester, college, mobile, branch, yearScheme } = req.body;

  try {
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: `Username '${username}' is already taken.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      username,
      password: hashedPassword,
      fullName,
      semester,
      college,
      mobile,
      branch,
      yearScheme,
    });

    res.status(201).json({ message: 'Registration successful.', user: newUser.rows[0] });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed due to an internal error.' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password.toString());
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT full_name, semester, college, branch, sgpa, cgpa FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update profile
const updateUserProfile = async (req, res) => {
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
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
