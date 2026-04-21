const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin        = require('../middleware/adminMiddleware');
const { spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { randomBytes } = require('crypto');

const uuidv4 = () => randomBytes(16).toString('hex');

// ─────────────────────────────────────────────────────────────────────────────
// KEY FIX: PostgreSQL's `pg` driver returns JSONB columns as already-parsed
// JavaScript objects/arrays — NOT as strings.
// Calling JSON.parse() on an already-parsed value silently returns garbage.
//
// This helper handles BOTH cases safely:
//   • Already a JS object/array  → return as-is
//   • A JSON string              → parse it
//   • null / undefined / bad val → return fallback
// ─────────────────────────────────────────────────────────────────────────────
function safeJson(val, fallback) {
  if (val === null || val === undefined) return fallback;
  // Already parsed by pg driver (object or array)
  if (typeof val === 'object') return val;
  // It's a string — try to parse
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Code execution engine
// ─────────────────────────────────────────────────────────────────────────────

const LANG_CONFIG = {
  python:     { ext: 'py',   cmd: 'python3', args: f => [f] },
  javascript: { ext: 'js',   cmd: 'node',    args: f => [f] },
  c:   { ext: 'c',   compile: (s,o) => ['gcc',  [s,'-o',o,'-lm','-std=c99']],   run: o => [o,[]] },
  cpp: { ext: 'cpp', compile: (s,o) => ['g++',  [s,'-o',o,'-lm','-std=c++17']], run: o => [o,[]] },
  java:   { ext: 'java' },
  csharp: { ext: 'cs', compile: (s,o) => ['mcs',['-out:'+o+'.exe',s]], run: o => ['mono',[o+'.exe']] },
};

const EXEC_TIMEOUT = 10000;
const MAX_OUTPUT   = 50000;
const TMP_DIR = path.join(os.tmpdir(), 'cc-code');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

function cleanupPath(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
}

function runProcess(cmd, args, stdin = '', timeout = EXEC_TIMEOUT) {
  return new Promise(resolve => {
    let stdout = '', stderr = '', timedOut = false;
    const proc = spawn(cmd, args, { env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });

    if (stdin) { proc.stdin.write(stdin); }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d; if (stdout.length > MAX_OUTPUT) proc.kill(); });
    proc.stderr.on('data', d => { stderr += d; if (stderr.length > MAX_OUTPUT) proc.kill(); });

    const timer = setTimeout(() => { timedOut = true; proc.kill('SIGKILL'); }, timeout);

    proc.on('close', code => { clearTimeout(timer); resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code, timedOut }); });
    proc.on('error', err  => { clearTimeout(timer); resolve({ stdout: '', stderr: err.message, code: -1, timedOut: false }); });
  });
}

async function executeCode(language, sourceCode, stdin = '') {
  const lang = LANG_CONFIG[language];
  if (!lang) return { success: false, stdout: '', stderr: `Language '${language}' not supported` };

  const id  = uuidv4().substring(0, 12);
  const dir = path.join(TMP_DIR, id);
  fs.mkdirSync(dir, { recursive: true });

  try {
    // ── Java ──────────────────────────────────────────────────────────────────
    if (language === 'java') {
      const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
      const className  = classMatch ? classMatch[1] : 'Solution';
      const srcFile    = path.join(dir, `${className}.java`);
      fs.writeFileSync(srcFile, sourceCode);

      const compile = await runProcess('javac', ['-cp', dir, srcFile], '', 15000);
      if (compile.code !== 0) {
        cleanupPath(dir);
        return { success: false, stdout: '', stderr: compile.stderr || 'Compilation error', compile_error: true };
      }
      const run = await runProcess('java', ['-cp', dir, '-Xmx128m', className], stdin);
      cleanupPath(dir);
      if (run.timedOut) return { success: false, stdout: run.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true };
      return { success: run.code === 0, stdout: run.stdout, stderr: run.stderr };
    }

    // ── C / C++ / C# (compiled) ───────────────────────────────────────────────
    if (lang.compile) {
      const srcFile = path.join(dir, `sol.${lang.ext}`);
      const outFile = path.join(dir, 'sol.out');
      fs.writeFileSync(srcFile, sourceCode);

      const [compCmd, compArgs] = lang.compile(srcFile, outFile);
      const compile = await runProcess(compCmd, compArgs, '', 15000);
      if (compile.code !== 0) {
        cleanupPath(dir);
        return { success: false, stdout: '', stderr: compile.stderr || 'Compilation error', compile_error: true };
      }
      const [runCmd, runArgs] = lang.run(outFile);
      const run = await runProcess(runCmd, runArgs, stdin);
      cleanupPath(dir);
      if (run.timedOut) return { success: false, stdout: run.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true };
      return { success: run.code === 0, stdout: run.stdout, stderr: run.stderr };
    }

    // ── Python / JavaScript (interpreted) ────────────────────────────────────
    const srcFile = path.join(dir, `sol.${lang.ext}`);
    fs.writeFileSync(srcFile, sourceCode);
    const run = await runProcess(lang.cmd, lang.args(srcFile), stdin);
    cleanupPath(dir);
    if (run.timedOut) return { success: false, stdout: run.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true };
    return { success: run.code === 0, stdout: run.stdout, stderr: run.stderr };

  } catch (err) {
    cleanupPath(dir);
    return { success: false, stdout: '', stderr: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/coding/run — execute code with custom stdin
// ─────────────────────────────────────────────────────────────────────────────
router.post('/run', authMiddleware, async (req, res) => {
  const { language, source_code, stdin = '' } = req.body;
  if (!language || !source_code)
    return res.status(400).json({ error: 'language and source_code required' });
  if (!LANG_CONFIG[language])
    return res.status(400).json({ error: `Language '${language}' not supported` });

  try {
    const result = await executeCode(language, source_code, stdin);
    res.json({
      stdout:         result.stdout  || '',
      stderr:         result.stderr  || '',
      compile_output: result.compile_error ? result.stderr : '',
      success:        result.success || false,
      tle:            result.tle     || false,
      compile_error:  result.compile_error || false,
      language,
    });
  } catch (e) {
    console.error('❌ Code execution error for user', req.user?.userId, 'language', language, ':', e.message);
    if (process.env.NODE_ENV !== 'production') console.error('Stack:', e.stack);
    res.status(500).json({ error: 'Execution failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/coding/submit — run ALL test cases (visible + hidden)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submit', authMiddleware, async (req, res) => {
  const { problem_id, language, source_code } = req.body;
  if (!problem_id || !language || !source_code)
    return res.status(400).json({ error: 'problem_id, language, source_code required' });

  try {
    const probRes = await pool.query(
      'SELECT * FROM coding_problems WHERE id=$1 AND is_active=true',
      [problem_id]
    );
    if (!probRes.rows.length) return res.status(404).json({ error: 'Problem not found' });

    const problem = probRes.rows[0];

    // ── FIX: use safeJson — pg returns JSONB as object, not string ────────────
    const testCases = safeJson(problem.test_cases, []);

    if (!testCases.length) {
      return res.status(400).json({ error: 'This problem has no test cases configured yet.' });
    }

    const results  = [];
    let allPassed  = true;

    for (const tc of testCases) {
      const output   = await executeCode(language, source_code, tc.input || '');
      const actual   = (output.stdout || '').trim();
      const expected = (tc.expected_output || '').trim();
      const passed   = output.success && !output.tle && !output.compile_error && actual === expected;
      if (!passed) allPassed = false;

      results.push({
        input:           tc.input           || '',
        expected_output: expected,
        actual_output:   actual,
        passed,
        tle:             output.tle           || false,
        compile_error:   output.compile_error || false,
        stderr:          output.stderr        || '',
        hidden:          tc.hidden            || false,
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const score  = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    const status = allPassed
      ? 'accepted'
      : results.some(r => r.compile_error) ? 'compile_error'
      : results.some(r => r.tle)           ? 'time_limit_exceeded'
      : 'wrong_answer';

    // Save submission
    await pool.query(
      `INSERT INTO coding_submissions
         (user_id, problem_id, language, source_code, passed_count, total_count, score, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [req.user.userId, problem_id, language, source_code, passedCount, testCases.length, score, status]
    );

    // Update acceptance_rate for this problem
    await pool.query(`
      UPDATE coding_problems SET acceptance_rate = (
        SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status='accepted') / NULLIF(COUNT(*),0), 1)
        FROM coding_submissions WHERE problem_id = $1
      ) WHERE id = $1
    `, [problem_id]).catch(() => {});

    // Mark as solved if all passed
    if (allPassed) {
      await pool.query(
        `INSERT INTO user_solved_problems (user_id, problem_id, solved_at, language)
         VALUES ($1,$2,NOW(),$3)
         ON CONFLICT (user_id, problem_id) DO UPDATE SET solved_at=NOW(), language=$3`,
        [req.user.userId, problem_id, language]
      );
    }

    // Mask hidden test case details before sending to client
    const clientResults = results.map(r =>
      r.hidden
        ? { ...r, input: '(hidden)', expected_output: '(hidden)', actual_output: r.passed ? '(hidden)' : '(hidden — wrong)' }
        : r
    );

    res.json({ passed: allPassed, score, status, results: clientResults, total: testCases.length, passed_count: passedCount });

  } catch (e) {
    console.error('❌ Coding submission error for user', req.user?.userId, 'problem', problem_id, ':', e.message);
    if (process.env.NODE_ENV !== 'production') console.error('Stack trace:', e.stack);
    res.status(500).json({ error: 'Submission failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coding/languages
// ─────────────────────────────────────────────────────────────────────────────
router.get('/languages', async (_req, res) => {
  res.json({ supported: Object.keys(LANG_CONFIG), engine: 'built-in' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coding/problems — list with filters
// ─────────────────────────────────────────────────────────────────────────────
router.get('/problems', authMiddleware, async (req, res) => {
  const { difficulty, tag, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let q = `SELECT cp.id, cp.title, cp.difficulty, cp.tags, cp.acceptance_rate, cp.companies, cp.created_at,
               CASE WHEN usp.problem_id IS NOT NULL THEN true ELSE false END as solved
             FROM coding_problems cp
             LEFT JOIN user_solved_problems usp ON cp.id=usp.problem_id AND usp.user_id=$1
             WHERE cp.is_active=true`;
    const params = [req.user.userId];
    let i = 2;
    if (difficulty) { q += ` AND cp.difficulty=$${i++}`;        params.push(difficulty); }
    if (tag)        { q += ` AND $${i++}=ANY(cp.tags)`;         params.push(tag); }
    if (search)     { q += ` AND cp.title ILIKE $${i++}`;       params.push(`%${search}%`); }
    q += ` ORDER BY cp.difficulty_order ASC, cp.id ASC LIMIT $${i++} OFFSET $${i}`;
    params.push(parseInt(limit), offset);

    const [data, count] = await Promise.all([
      pool.query(q, params),
      pool.query('SELECT COUNT(*) FROM coding_problems WHERE is_active=true'),
    ]);
    res.json({ problems: data.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch problems: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coding/problems/:id — single problem
// ── FIX: use safeJson everywhere — pg returns JSONB as objects not strings ───
// ─────────────────────────────────────────────────────────────────────────────
router.get('/problems/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*,
         (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id AND status='accepted') as accepted_count,
         (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id) as total_submissions,
         CASE WHEN usp.problem_id IS NOT NULL THEN true ELSE false END as solved
       FROM coding_problems cp
       LEFT JOIN user_solved_problems usp ON cp.id=usp.problem_id AND usp.user_id=$1
       WHERE cp.id=$2 AND cp.is_active=true`,
      [req.user.userId, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Problem not found' });

    const p = result.rows[0];

    // ── Parse JSONB fields safely (handles both string and object from pg) ────
    const testCasesRaw  = safeJson(p.test_cases,   []);
    const examples      = safeJson(p.examples,      []);
    const hints         = safeJson(p.hints,         []);
    const starter_code  = safeJson(p.starter_code,  {});

    // Only expose VISIBLE (non-hidden) test cases to the user
    const sample_cases = Array.isArray(testCasesRaw)
      ? testCasesRaw.filter(tc => !tc.hidden).slice(0, 5)
      : [];

    // Return cleaned problem — never expose hidden test cases
    delete p.test_cases;

    res.json({
      ...p,
      sample_cases,
      examples,
      hints,
      starter_code,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load problem: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coding/submissions
// ─────────────────────────────────────────────────────────────────────────────
router.get('/submissions', authMiddleware, async (req, res) => {
  const { problem_id } = req.query;
  try {
    let q = `SELECT cs.*, cp.title as problem_title
             FROM coding_submissions cs
             JOIN coding_problems cp ON cs.problem_id=cp.id
             WHERE cs.user_id=$1`;
    const params = [req.user.userId];
    if (problem_id) { q += ' AND cs.problem_id=$2'; params.push(problem_id); }
    q += ' ORDER BY cs.submitted_at DESC LIMIT 50';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/coding/leaderboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/leaderboard', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.username, u.full_name, u.branch,
        COUNT(DISTINCT usp.problem_id) as solved_count,
        SUM(CASE WHEN cp.difficulty='easy'   THEN 1 ELSE 0 END) as easy,
        SUM(CASE WHEN cp.difficulty='medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN cp.difficulty='hard'   THEN 1 ELSE 0 END) as hard
      FROM users u
      JOIN user_solved_problems usp ON u.user_id=usp.user_id
      JOIN coding_problems cp ON usp.problem_id=cp.id
      WHERE u.is_blocked=false
      GROUP BY u.user_id, u.username, u.full_name, u.branch
      ORDER BY solved_count DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Problem CRUD
// ─────────────────────────────────────────────────────────────────────────────

// GET all problems (admin view — includes inactive)
router.get('/admin/problems', authMiddleware, isAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT cp.*,
        (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id AND status='accepted') as accepted,
        (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id) as total_submissions
      FROM coding_problems cp
      ORDER BY cp.created_at DESC
    `);
    // Safely parse JSONB fields for every row
    const rows = result.rows.map(row => ({
      ...row,
      test_cases:   safeJson(row.test_cases,  []),
      examples:     safeJson(row.examples,    []),
      hints:        safeJson(row.hints,       []),
      starter_code: safeJson(row.starter_code,{}),
    }));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed: ' + e.message });
  }
});

// CREATE problem
router.post('/admin/problems', authMiddleware, isAdmin, async (req, res) => {
  const { title, description, difficulty, tags, constraints, hints, starter_code, test_cases, examples, companies } = req.body;
  if (!title || !description || !difficulty)
    return res.status(400).json({ error: 'title, description, difficulty required' });

  const diffOrder = { easy: 1, medium: 2, hard: 3 };
  try {
    const result = await pool.query(
      `INSERT INTO coding_problems
         (title, description, difficulty, difficulty_order, tags, constraints,
          hints, starter_code, test_cases, examples, companies, created_by_admin, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,true) RETURNING *`,
      [
        title, description, difficulty, diffOrder[difficulty] || 2,
        tags || [],
        constraints || '',
        JSON.stringify(Array.isArray(hints)        ? hints        : []),
        JSON.stringify(typeof starter_code==='object' && starter_code ? starter_code : {}),
        JSON.stringify(Array.isArray(test_cases)   ? test_cases   : []),
        JSON.stringify(Array.isArray(examples)     ? examples     : []),
        companies || [],
      ]
    );
    const row = result.rows[0];
    res.status(201).json({
      ...row,
      test_cases:   safeJson(row.test_cases,  []),
      examples:     safeJson(row.examples,    []),
      hints:        safeJson(row.hints,       []),
      starter_code: safeJson(row.starter_code,{}),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create: ' + e.message });
  }
});

// UPDATE problem
router.put('/admin/problems/:id', authMiddleware, isAdmin, async (req, res) => {
  const { title, description, difficulty, tags, constraints, hints, starter_code, test_cases, examples, companies, is_active } = req.body;
  const diffOrder = { easy: 1, medium: 2, hard: 3 };
  try {
    const result = await pool.query(
      `UPDATE coding_problems
       SET title=$1, description=$2, difficulty=$3, difficulty_order=$4,
           tags=$5, constraints=$6, hints=$7, starter_code=$8,
           test_cases=$9, examples=$10, companies=$11, is_active=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [
        title, description, difficulty, diffOrder[difficulty] || 2,
        tags || [],
        constraints || '',
        JSON.stringify(Array.isArray(hints)        ? hints        : []),
        JSON.stringify(typeof starter_code==='object' && starter_code ? starter_code : {}),
        JSON.stringify(Array.isArray(test_cases)   ? test_cases   : []),
        JSON.stringify(Array.isArray(examples)     ? examples     : []),
        companies || [],
        is_active !== false,
        req.params.id,
      ]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Problem not found' });
    const row = result.rows[0];
    res.json({
      ...row,
      test_cases:   safeJson(row.test_cases,  []),
      examples:     safeJson(row.examples,    []),
      hints:        safeJson(row.hints,       []),
      starter_code: safeJson(row.starter_code,{}),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update: ' + e.message });
  }
});

// DELETE (soft — archive)
router.delete('/admin/problems/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE coding_problems SET is_active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'Problem archived successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed: ' + e.message });
  }
});

module.exports = router;
