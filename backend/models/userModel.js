const pool = require('../db');
const bcrypt = require('bcrypt');


const createUser = async (userData) => {
    const { username, email, password, fullName, semester, college, mobile, branch, yearScheme, otp, otp_expiry } = userData;
    return pool.query(
      `INSERT INTO users (username, email, password, full_name, semester, college, mobile, branch, year_scheme, otp, otp_expiry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [username, email, password, fullName, semester, college, mobile, branch, yearScheme, otp, otp_expiry]
    );
  };
  
  const clearOTP = async (username) => {
    return pool.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE username = $1', [username]);
  };
async function findUserByUsername(username) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}
async function findUserById(userId) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        return result.rows[0]; // Return the user found
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
}
async function updateUserProfile(userId, profileData) {
    const { full_name, semester, college, mobile, branch, year_scheme } = profileData;
    try {
        await pool.query(
            'UPDATE users SET full_name = $1, semester = $2, college = $3, mobile = $4, branch = $5, year_scheme = $6 WHERE user_id = $7',
            [full_name, semester, college, mobile, branch, year_scheme, userId]
        );
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

module.exports = {
    createUser,
    findUserByUsername,
    updateUserProfile,
    findUserById,
    clearOTP,
};
