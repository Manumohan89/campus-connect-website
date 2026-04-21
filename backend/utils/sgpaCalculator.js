// sgpaCalculator.js
const pool = require('../db');
const fs = require('fs');
const path = require('path');

// Safe upsert — never touches GENERATED ALWAYS columns (is_failed)
const MARKS_UPSERT = `
  INSERT INTO marks (user_id, subject_code, subject_name, internal_marks, external_marks, total, grade_points, credits)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (user_id, subject_code) DO UPDATE SET
    subject_name   = EXCLUDED.subject_name,
    internal_marks = EXCLUDED.internal_marks,
    external_marks = EXCLUDED.external_marks,
    total          = EXCLUDED.total,
    grade_points   = EXCLUDED.grade_points,
    credits        = EXCLUDED.credits
`;

async function calculateSgpa(excelPath, userId) {
  try {
    const jsonPath = excelPath.replace('.xlsx', '.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('JSON file not found:', jsonPath);
      return 0;
    }
    const vtuData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const subject of vtuData.subjects) {
      await pool.query(MARKS_UPSERT, [
        userId,
        subject.subject_code,
        subject.subject_name,
        subject.internal_marks,
        subject.external_marks,
        subject.total_marks,
        subject.grade_points,
        subject.credits,
      ]);
    }
    return vtuData.sgpa;
  } catch (error) {
    console.error('Error calculating SGPA:', error);
    return 0;
  }
}

async function saveMarksToDb(userId, subjectCode, subjectName, internalMarks, externalMarks, gradePoints, credits) {
  // Kept for backward compatibility
  await pool.query(MARKS_UPSERT, [
    userId, subjectCode, subjectName, internalMarks, externalMarks,
    internalMarks + externalMarks, gradePoints, credits,
  ]);
}

async function calculateCgpa(userId) {
  const result = await pool.query(
    'SELECT grade_points, credits FROM marks WHERE user_id = $1',
    [userId]
  );
  let totalGradePoints = 0;
  let totalCredits = 0;
  result.rows.forEach(row => {
    totalGradePoints += row.grade_points * row.credits;
    totalCredits += row.credits;
  });
  const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  return parseFloat(cgpa.toFixed(2));
}

async function saveSgpaToDb(userId, sgpa) {
  await pool.query('UPDATE users SET sgpa = $1 WHERE user_id = $2', [sgpa, userId]);
}

module.exports = { calculateSgpa, calculateCgpa, saveSgpaToDb, saveMarksToDb };
