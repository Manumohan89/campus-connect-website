/**
 * VTU Marks Card PDF Parser — v2.0
 * Tested against real VTU PDFs (December-2023 / January-2024 format)
 * 
 * PDF text format observed:
 *   {SUBJECT_CODE}{SUBJECT_NAME (may span lines)}{INTERNAL}{EXTERNAL}{TOTAL}{P/F}{DATE}
 *   e.g. "21CS51AUTOMATA THEORY AND\nCOMPILER DESIGN\n494493P2024-05-09"
 *   Numbers are concatenated: "494493" = internal:49, external:44, total:93
 * 
 * Works on Render.com — pure Node.js, no Python, no disk writes
 * NOTE: pdf-parse is lazy-required inside the async function to avoid the
 *       module-load-time file-read bug that causes ENOENT on Render cold starts.
 */
'use strict';

// ── VTU Grade point table ─────────────────────────────────────────────────────
function getGradePoints(total) {
  if (total >= 90) return 10;
  if (total >= 80) return 9;
  if (total >= 70) return 8;
  if (total >= 60) return 7;
  if (total >= 50) return 6;
  if (total >= 40) return 4;
  return 0;
}

// ── Official VTU credits (2021/2022/2018/2015 schemes) ───────────────────────
const OFFICIAL_CREDITS = {
  // 2021 Scheme — Common Sem 1–2
  '21MAT11':4,'21PHY12':4,'21CHE12':4,'21ELN14':3,'21ELN15':3,
  '21PHYL16':1,'21CHEL17':1,'21ELN18':1,
  '21MAT21':4,'21PHY22':4,'21CHE22':4,'21ELN24':3,'21ELN25':3,
  '21PHYL26':1,'21CHEL27':1,
  // 2021 Scheme — CSE Sem 3–8
  '21MAT31':3,'21CS32':4,'21CS33':4,'21CS34':3,'21CSL35':1,
  '21UH36':1,'21KSK37':1,'21KBK37':1,'21CIP37':1,
  '21CS41':3,'21CS42':4,'21CS43':4,'21CS44':3,'21BE45':2,
  '21CSL46':1,'21KSK47':1,'21KBK47':1,'21UH49':1,'21INT49':2,
  '21CS51':3,'21CS52':4,'21CS53':4,'21CS54':3,'21CSL55':1,
  '21CSL582':1,'21CS582':1,'21CS583':1,'21CS584':1,
  '21RMI56':2,'21CS56':2,'21CIV57':1,
  '21CS61':3,'21CS62':4,'21CS63':3,'21CSL66':1,'21CSMP67':2,'21INT68':3,
  '21CS71':3,'21CS72':2,'21CSP76':10,'21CS81':1,'21INT82':15,
  // 2021 Scheme — ECE
  '21EC32':4,'21EC33':4,'21EC34':3,'21ECL35':1,
  '21EC41':3,'21EC42':4,'21EC43':4,'21EC44':3,'21ECL46':1,
  '21EC51':3,'21EC52':4,'21EC53':3,'21EC54':3,'21ECL55':1,
  '21EC61':3,'21EC62':4,'21EC63':3,'21ECL66':1,'21ECMP67':2,
  // 2021 Scheme — ISE
  '21IS32':4,'21IS33':4,'21IS34':3,'21ISL35':1,
  '21IS41':3,'21IS42':4,'21IS43':4,'21IS44':3,'21ISL46':1,
  '21IS51':3,'21IS52':4,'21IS53':3,'21IS54':3,'21ISL55':1,
  '21IS61':3,'21IS62':4,'21IS63':3,'21ISL66':1,
  // 2021 Scheme — ME
  '21ME32':4,'21ME33':4,'21ME34':3,'21MEL35':1,
  '21ME41':3,'21ME42':4,'21ME43':4,'21ME44':3,'21MEL46':1,
  '21ME51':3,'21ME52':4,'21ME53':3,'21ME54':3,'21MEL55':1,
  // 2021 Scheme — CV
  '21CV32':4,'21CV33':4,'21CV34':3,'21CVL35':1,
  '21CV41':3,'21CV42':4,'21CV43':4,'21CV44':3,'21CVL46':1,
  '21CV51':3,'21CV52':4,'21CV53':3,'21CV54':3,'21CVL55':1,
  // 2022 Scheme — Common Sem 1–2
  '22PHY12':4,'22CHE12':4,'22MAT11':4,'22ELN14':3,'22ELN15':3,
  '22PHYL16':1,'22CHEL17':1,
  '22MAT21':4,'22PHY22':4,'22CHE22':4,'22ELN24':3,'22ELN25':3,
  '22PHYL26':1,'22CHEL27':1,
  // 2022 Scheme — CSE Sem 3–8
  '22CS32':4,'22CS33':4,'22CS34':3,'22CSL35':1,'22MAT31':3,
  '22CS41':3,'22CS42':4,'22CS43':4,'22CS44':3,'22CSL46':1,
  '22CS51':3,'22CS52':4,'22CS53':3,'22CS54':3,'22CSL55':1,
  '22CS61':3,'22CS62':4,'22CS63':3,'22CSL66':1,
  // 2018 Scheme
  '18MAT11':4,'18PHY12':4,'18CHE12':4,'18ELN14':3,'18ELN15':3,
  '18PHYL16':1,'18CHEL17':1,
  '18CS32':4,'18CS33':4,'18CS34':3,'18CSL38':2,
  '18CS42':3,'18CS43':3,'18CS44':3,'18CS45':3,'18CSL46':2,
  '18CS51':3,'18CS52':3,'18CS53':3,'18CS54':3,'18CSL56':2,
  '18CS61':3,'18CS62':3,'18CS63':3,'18CS64':3,'18CSL66':2,
  // 2015 Scheme
  '15CS32':4,'15CS33':4,'15CS34':3,'15CSL37':3,'15CSL38':1,
  '15CS42':4,'15CS43':4,'15CS44':3,'15CSL48':1,
  '15CS51':4,'15CS52':4,'15CS53':3,'15CS54':3,'15CSL57':1,
  '15CS61':4,'15CS62':4,'15CS63':3,'15CS64':3,'15CSL67':1,
};

// ── Regex patterns ────────────────────────────────────────────────────────────
// VTU subject code: starts with 2 digits, then letters, then digits, optional X
const VTU_CODE = /\b(\d{2}[A-Z]{2,6}\d{2,4}X?)\b/i;

// ── Split concatenated marks string e.g. "494493" → {49, 44, 93} ─────────────
function splitMarks(digits) {
  const n = digits.length;
  if (n < 4) return null;

  // Try all splits: internal (1-2 digits), external (2-3 digits), total (2-3 digits)
  for (const intLen of [2, 1]) {
    for (const extLen of [3, 2]) {
      const totLen = n - intLen - extLen;
      if (totLen < 2 || totLen > 3) continue;

      const internal = parseInt(digits.slice(0, intLen), 10);
      const external = parseInt(digits.slice(intLen, intLen + extLen), 10);
      const total    = parseInt(digits.slice(intLen + extLen), 10);

      // Validate: sum must equal total (allow ±1 rounding)
      if (Math.abs(internal + external - total) <= 1 &&
          internal >= 0 && internal <= 50 &&
          external >= 0 && external <= 100 &&
          total    >= 0 && total    <= 150) {
        return { internal, external, total };
      }
    }
  }
  return null;
}

// ── Guess credits from subject code when not in lookup ───────────────────────
function guessCredits(code) {
  const upper = code.toUpperCase();
  if (/L\d+|LAB/.test(upper))  return 1;  // Labs: 1 credit
  if (/P\d+/.test(upper))      return 2;  // Project: 2 credits
  if (/INT\d+/.test(upper))    return 3;  // Internship
  if (/MP\d+/.test(upper))     return 2;  // Mini project
  return 3;                               // Default theory
}

// ── Main parser ───────────────────────────────────────────────────────────────
function parseVtuText(text) {
  // Clean up null bytes and normalize whitespace
  const clean = text.replace(/\u0000/g, '').replace(/\r/g, '');

  const subjects = [];
  const seen = new Set();

  // ── Strategy 1: Regex-based extraction ────────────────────────────────────
  // Pattern: subject code followed (possibly across newlines) by marks+result+date
  // The date format is YYYY-MM-DD after P/F/A/W
  const RECORD = /\b(\d{2}[A-Z]{2,6}\d{2,4}X?)\s*([\s\S]*?)(\d{4,8})\s*(?:[PFAWpfaw])\s*\d{4}-\d{2}-\d{2}/g;

  let match;
  while ((match = RECORD.exec(clean)) !== null) {
    const code     = match[1].toUpperCase();
    const namePart = match[2].replace(/\s+/g, ' ').trim();
    const numStr   = match[3];

    if (seen.has(code)) continue;

    const marks = splitMarks(numStr);
    if (!marks) continue;

    const { internal, external, total } = marks;
    const credits  = OFFICIAL_CREDITS[code] || guessCredits(code);
    const gp       = getGradePoints(total);

    // Clean subject name: remove any leftover digits/dates
    const name = namePart.replace(/\d{4}-\d{2}-\d{2}/g, '').replace(/\s+/g, ' ').trim()
                 .replace(/^[^A-Z]*/i, '').substring(0, 100) || code;

    subjects.push({
      subject_code:        code,
      subject_name:        name || code,
      internal_marks:      internal,
      external_marks:      external,
      total_marks:         total,
      credits,
      grade_points:        gp,
      grade_point_credits: gp * credits,
    });
    seen.add(code);
  }

  // ── Strategy 2: Line-by-line fallback ─────────────────────────────────────
  // Used when Strategy 1 gets 0 subjects (older PDF formats)
  if (subjects.length === 0) {
    const lines = clean.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      const codeMatch = line.match(/^(\d{2}[A-Z]{2,6}\d{2,4}X?)/i);
      if (codeMatch) {
        const code = codeMatch[1].toUpperCase();
        if (!seen.has(code)) {
          // Collect next few lines to find marks
          const window = lines.slice(i, i + 6).join(' ');
          // Look for 4-8 consecutive digits followed by P/F
          const marksMatch = window.match(/(\d{4,8})\s*[PFAWpfaw]/);
          if (marksMatch) {
            const marks = splitMarks(marksMatch[1]);
            if (marks) {
              const { internal, external, total } = marks;
              const credits = OFFICIAL_CREDITS[code] || guessCredits(code);
              const gp      = getGradePoints(total);
              subjects.push({
                subject_code: code, subject_name: code,
                internal_marks: internal, external_marks: external,
                total_marks: total, credits, grade_points: gp,
                grade_point_credits: gp * credits,
              });
              seen.add(code);
            }
          }
        }
      }
      i++;
    }
  }

  return subjects;
}

// ── SGPA calculator ───────────────────────────────────────────────────────────
function calcSgpa(subjects) {
  const totalCredits = subjects.reduce((s, sub) => s + (sub.credits || 0), 0);
  const totalGP      = subjects.reduce((s, sub) => s + (sub.grade_point_credits || 0), 0);
  const sgpa = totalCredits > 0 ? Math.round((totalGP / totalCredits) * 100) / 100 : 0;
  return { sgpa, totalCredits, totalGP };
}

// ── Main exported async function ──────────────────────────────────────────────
async function parseVtuPdf(buffer) {
  // Use pdf-parse/lib/pdf-parse.js directly to bypass the index.js test-file
  // read that causes ENOENT crashes on Render.com and Vercel cold starts.
  // This is the standard community fix for pdf-parse@1.x in serverless/cloud envs.
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (e) {
    throw new Error('Could not read PDF. Please ensure it is a valid, non-corrupted PDF file.');
  }

  const text = data.text || '';
  if (text.replace(/\s/g, '').length < 20) {
    throw new Error('PDF appears to be a scanned image. Please upload a text-based VTU marks card from the official VTU portal.');
  }

  const subjects = parseVtuText(text);

  if (subjects.length === 0) {
    throw new Error(
      'No VTU subject codes found in this PDF. ' +
      'Please upload an official VTU marks card downloaded from results.vtu.ac.in'
    );
  }

  const { sgpa, totalCredits, totalGP } = calcSgpa(subjects);

  return { subjects, sgpa, total_credits: totalCredits, total_grade_points: totalGP };
}

module.exports = { parseVtuPdf, getGradePoints, calcSgpa, splitMarks };
