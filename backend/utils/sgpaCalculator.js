const ExcelJS = require('exceljs');
const pool = require('../db');

function cleanData(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const cleanedValue = parseInt(value.toString().replace(/[^0-9]/g, ''), 10);
  return isNaN(cleanedValue) ? 0 : cleanedValue;
}

function convertToGradePoints(totalMarks) {
  if (totalMarks >= 90) return 10;
  if (totalMarks >= 80) return 9;
  if (totalMarks >= 70) return 8;
  if (totalMarks >= 60) return 7;
  if (totalMarks >= 50) return 6;
  if (totalMarks >= 40) return 5;
  return 0;
}

function getCreditsForSubject(subjectCode) {
  const creditsMap = {
    '21CS51': 3, '21CS52': 4, '21CS53': 3, '21CS54': 3, '21CSL55': 1, '21RMI56': 2, '21CIV57': 1, '21CSL582': 1,
    '21MAT31': 3, '21CS32': 4, '21CS33': 4, '21CS34': 3, '21CSL35': 1, '21SCR36': 1, '21KBK37': 1,
    'BCS301': 4, 'BCS302': 4, 'BCS303': 4, 'BCS304': 3, 'BCSL305': 1, 'BSCK307': 1, 'BNSK359': 0,
    'BMATS101': 4, 'BPHYS102': 4, 'BPOPS103': 3, 'BESCK104B': 3, 'BETCK105I': 3, 'BENGK106': 1, 'BICOK107': 1, 'BIDTK158': 1,
  };
  return creditsMap[subjectCode] || 0;
}


async function calculateSgpa(excelPath, userId) {
  // Ensure the path is a string and valid
  if (typeof excelPath !== 'string') {
    throw new TypeError('The "path" argument must be of type string.');
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const sheet = workbook.worksheets[0];

  let totalPoints = 0;
  let totalCredits = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      const subjectCode = row.getCell(1).value;
      const subjectName = row.getCell(2).value;
      let internalMarks = row.getCell(3).value;
      let externalMarks = row.getCell(4).value;

      internalMarks = cleanData(internalMarks);
      externalMarks = cleanData(externalMarks);

      const totalMarks = internalMarks + externalMarks;
      const gradePoints = convertToGradePoints(totalMarks);
      const credits = getCreditsForSubject(subjectCode);

      totalPoints += gradePoints * credits;
      totalCredits += credits;

      saveMarksToDb(userId, subjectCode, subjectName, internalMarks, externalMarks, gradePoints, credits);
    }
  });

  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  await saveSgpaToDb(userId, sgpa.toFixed(2)); // Ensure only two decimal points

  return sgpa.toFixed(2);
}

async function saveMarksToDb(userId, subjectCode, subjectName, internalMarks, externalMarks, gradePoints, credits) {
  await pool.query(
    'INSERT INTO marks (user_id, subject_code, subject_name, internal_marks, external_marks, total, sgpa, credits) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [userId, subjectCode, subjectName, internalMarks, externalMarks, internalMarks + externalMarks, gradePoints, credits]
  );
}

async function calculateCgpa(userId) {
  const result = await pool.query('SELECT sgpa, credits FROM marks WHERE user_id = $1', [userId]);
  const sGpaCredits = result.rows.map(row => ({
    sgpa: row.sgpa,
    credits: row.credits,
  }));
  
  let totalSgpaPoints = 0;
  let totalCredits = 0;

  sGpaCredits.forEach(item => {
    totalSgpaPoints += item.sgpa * item.credits;
    totalCredits += item.credits;
  });

  const cgpa = totalCredits > 0 ? totalSgpaPoints / totalCredits : 0;
  return cgpa.toFixed(2); // Ensure only two decimal points
}

async function saveSgpaToDb(userId, sgpa) {
  await pool.query('UPDATE users SET sgpa = $1 WHERE user_id = $2', [sgpa, userId]);
}

module.exports = {
  calculateSgpa,
  calculateCgpa,
  saveSgpaToDb,
};