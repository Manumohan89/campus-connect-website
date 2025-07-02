const pool = require('../db');

// Create new user
const createUser = async (userData) => {
  const { username, password, fullName, semester, college, mobile, branch, yearScheme } = userData;

  return pool.query(
    `INSERT INTO users (username, password, full_name, semester, college, mobile, branch, year_scheme)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [username, password, fullName, semester, college, mobile, branch, yearScheme]
  );
};

// Find user by username
const findUserByUsername = async (username) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
};

// Find user by ID
const findUserById = async (userId) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (userId, profileData) => {
  const { full_name, semester, college, mobile, branch, year_scheme } = profileData;

  try {
    await pool.query(
      `UPDATE users
       SET full_name = $1, semester = $2, college = $3, mobile = $4, branch = $5, year_scheme = $6
       WHERE user_id = $7`,
      [full_name, semester, college, mobile, branch, year_scheme, userId]
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  updateUserProfile,
};
