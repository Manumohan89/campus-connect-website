const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');
const pool = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel'); // Adjust the path as necessary
const { calculateSgpa, calculateCgpa } = require('../utils/sgpaCalculator');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { username, email, password, fullName, semester, college, mobile, branch, yearScheme } = req.body;

  try {
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: `The username '${username}' is already taken. Please choose a different username.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser({
      username,
      email,
      password: hashedPassword,
      fullName,
      semester,
      college,
      mobile,
      branch,
      yearScheme,
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

        const storedPassword = user.password.toString();  // Ensure the password is a string

        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.user_id }, config.jwtSecret, { expiresIn: '1h' });

        res.json({ token });

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
  
      const user = userResult.rows[0];
  
      res.status(200).json(user);
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

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    
};
