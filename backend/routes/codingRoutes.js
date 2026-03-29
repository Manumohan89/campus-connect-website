const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { randomBytes } = require('crypto');
const uuidv4 = () => randomBytes(16).toString('hex');

// ── FREE Built-in Code Runner ─────────────────────────────────────────────────
// Executes code using the system's installed runtimes.
// No API key, no paid service — runs Python3, Node.js, gcc, g++, mono (C#)
// on the same server. Safe for educational use with timeouts + memory limits.

const LANG_CONFIG = {
  python: {
    ext: 'py',
    cmd: 'python3',
    args: (file) => [file],
    available: () => checkCmd('python3'),
  },
  javascript: {
    ext: 'js',
    cmd: 'node',
    args: (file) => [file],
    available: () => checkCmd('node'),
  },
  c: {
    ext: 'c',
    compile: (src, out) => ['gcc', [src, '-o', out, '-lm', '-std=c99']],
    run: (out) => [out, []],
    available: () => checkCmd('gcc'),
  },
  cpp: {
    ext: 'cpp',
    compile: (src, out) => ['g++', [src, '-o', out, '-lm', '-std=c++17']],
    run: (out) => [out, []],
    available: () => checkCmd('g++'),
  },
  java: {
    ext: 'java',
    // Extract class name from code, compile then run
    compile: (src, dir) => ['javac', ['-cp', dir, src]],
    run: (dir, className) => ['java', ['-cp', dir, '-Xmx128m', className]],
    available: () => checkCmd('javac'),
  },
  csharp: {
    ext: 'cs',
    compile: (src, out) => ['mcs', ['-out:' + out + '.exe', src]],
    run: (out) => ['mono', [out + '.exe']],
    available: () => checkCmd('mcs'),
  },
};

function checkCmd(cmd) {
  try {
    const { execSync } = require('child_process');
    execSync(`which ${cmd} 2>/dev/null || where ${cmd} 2>/dev/null`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

const EXEC_TIMEOUT = 10000; // 10 seconds max execution time
const TMP_DIR = path.join(os.tmpdir(), 'campus-connect-code');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

function cleanup(...files) {
  files.forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });
}

function runProcess(cmd, args, stdin = '', timeout = EXEC_TIMEOUT) {
  return new Promise((resolve) => {
    let stdout = '', stderr = '', timedOut = false;

    const proc = spawn(cmd, args, {
      timeout,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });

    if (stdin) proc.stdin.write(stdin);
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); if (stdout.length > 50000) proc.kill(); });
    proc.stderr.on('data', d => { stderr += d.toString(); if (stderr.length > 10000) proc.kill(); });

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code, timedOut });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: err.message, code: -1, timedOut: false });
    });
  });
}

async function executeCode(language, sourceCode, stdin = '') {
  const lang = LANG_CONFIG[language];
  if (!lang) return { success: false, error: `Language '${language}' not supported` };

  const id = uuidv4().replace(/-/g, '').substring(0, 12);
  const srcFile = path.join(TMP_DIR, `${id}.${lang.ext}`);
  let filesToClean = [srcFile];

  try {
    // Write source file
    let code = sourceCode;
    // For Java: ensure class name is Solution or extract it
    if (language === 'java') {
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'Solution';
      const javaDir = path.join(TMP_DIR, id);
      fs.mkdirSync(javaDir, { recursive: true });
      const javaFile = path.join(javaDir, `${className}.java`);
      fs.writeFileSync(javaFile, code);
      filesToClean = [javaDir];

      // Compile
      const compileResult = await runProcess('javac', ['-cp', javaDir, javaFile], '', 15000);
      if (compileResult.code !== 0) {
        cleanup(...filesToClean);
        return { success: false, stdout: '', stderr: compileResult.stderr || 'Compilation failed', compile_error: true, language };
      }

      // Run
      const runResult = await runProcess('java', ['-cp', javaDir, '-Xmx128m', className], stdin);
      cleanup(...filesToClean);
      if (runResult.timedOut) return { success: false, stdout: runResult.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true, language };
      return { success: runResult.code === 0, stdout: runResult.stdout, stderr: runResult.stderr, language };
    }

    fs.writeFileSync(srcFile, code);

    if (lang.compile) {
      // Compiled language (C, C++, C#)
      const outFile = path.join(TMP_DIR, id + (language === 'csharp' ? '' : '.out'));
      filesToClean.push(outFile, outFile + '.exe');

      const [compileCmd, compileArgs] = lang.compile(srcFile, outFile);
      const compileResult = await runProcess(compileCmd, compileArgs, '', 15000);
      if (compileResult.code !== 0) {
        cleanup(...filesToClean);
        return { success: false, stdout: '', stderr: compileResult.stderr || 'Compilation failed', compile_error: true, language };
      }

      const [runCmd, runArgs] = lang.run(outFile);
      const runResult = await runProcess(runCmd, runArgs, stdin);
      cleanup(...filesToClean);
      if (runResult.timedOut) return { success: false, stdout: runResult.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true, language };
      return { success: runResult.code === 0, stdout: runResult.stdout, stderr: runResult.stderr, language };

    } else {
      // Interpreted language (Python, JS)
      const runResult = await runProcess(lang.cmd, lang.args(srcFile), stdin);
      cleanup(...filesToClean);
      if (runResult.timedOut) return { success: false, stdout: runResult.stdout, stderr: 'Time Limit Exceeded (10s)', tle: true, language };
      return { success: runResult.code === 0, stdout: runResult.stdout, stderr: runResult.stderr, language };
    }

  } catch (err) {
    cleanup(...filesToClean);
    return { success: false, stdout: '', stderr: err.message, language };
  }
}

// Get available languages on this server
async function getAvailableLangs() {
  const available = {};
  for (const [lang, config] of Object.entries(LANG_CONFIG)) {
    try { available[lang] = config.available(); } catch { available[lang] = false; }
  }
  return available;
}

// ── POST /api/coding/run ─────────────────────────────────────────────────────
router.post('/run', authMiddleware, async (req, res) => {
  const { language, source_code, stdin = '' } = req.body;
  if (!language || !source_code) return res.status(400).json({ error: 'language and source_code required' });
  if (!LANG_CONFIG[language]) return res.status(400).json({ error: `Language '${language}' not supported. Use: ${Object.keys(LANG_CONFIG).join(', ')}` });

  try {
    const result = await executeCode(language, source_code, stdin);
    res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_error ? result.stderr : '',
      success: result.success,
      tle: result.tle || false,
      language,
      engine: 'built-in',
    });
  } catch (e) {
    res.status(500).json({ error: 'Execution failed: ' + e.message });
  }
});

// ── POST /api/coding/submit ──────────────────────────────────────────────────
router.post('/submit', authMiddleware, async (req, res) => {
  const { problem_id, language, source_code } = req.body;
  if (!problem_id || !language || !source_code) return res.status(400).json({ error: 'problem_id, language, source_code required' });

  try {
    const probRes = await pool.query('SELECT * FROM coding_problems WHERE id=$1 AND is_active=true', [problem_id]);
    if (!probRes.rows.length) return res.status(404).json({ error: 'Problem not found' });

    const problem = probRes.rows[0];
    let testCases = [];
    try { testCases = JSON.parse(problem.test_cases || '[]'); } catch {}

    const results = [];
    let allPassed = true;

    for (const tc of testCases) {
      const output = await executeCode(language, source_code, tc.input || '');
      const actual = (output.stdout || '').trim();
      const expected = (tc.expected_output || '').trim();
      const passed = actual === expected && output.success && !output.tle;
      if (!passed) allPassed = false;

      results.push({
        input: tc.input,
        expected_output: expected,
        actual_output: actual,
        passed,
        tle: output.tle || false,
        compile_error: output.compile_error || false,
        stderr: output.stderr,
        hidden: tc.hidden || false,
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    const status = allPassed ? 'accepted' : results.some(r => r.tle) ? 'time_limit_exceeded' : results.some(r => r.compile_error) ? 'compile_error' : 'wrong_answer';

    await pool.query(
      `INSERT INTO coding_submissions (user_id, problem_id, language, source_code, passed_count, total_count, score, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [req.user.userId, problem_id, language, source_code, passedCount, testCases.length, score, status]
    );

    if (allPassed) {
      await pool.query(
        `INSERT INTO user_solved_problems (user_id, problem_id, solved_at, language)
         VALUES ($1,$2,NOW(),$3) ON CONFLICT (user_id, problem_id) DO UPDATE SET solved_at=NOW(), language=$3`,
        [req.user.userId, problem_id, language]
      );
    }

    res.json({
      passed: allPassed,
      score,
      status,
      results: results.map(r => r.hidden ? { ...r, input: '(hidden)', expected_output: '(hidden)' } : r),
      total: testCases.length,
      passed_count: passedCount,
      engine: 'built-in',
    });

  } catch (e) {
    res.status(500).json({ error: 'Submission failed: ' + e.message });
  }
});

// ── GET /api/coding/languages ─────────────────────────────────────────────────
router.get('/languages', async (req, res) => {
  const available = await getAvailableLangs();
  res.json({
    supported: Object.keys(LANG_CONFIG),
    available,
    engine: 'built-in',
    note: 'Code execution uses system-installed runtimes. No API key required.',
  });
});

// ── GET /api/coding/problems ─────────────────────────────────────────────────
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
    if (difficulty) { q += ` AND cp.difficulty=$${i++}`; params.push(difficulty); }
    if (tag)        { q += ` AND $${i++}=ANY(cp.tags)`; params.push(tag); }
    if (search)     { q += ` AND cp.title ILIKE $${i++}`; params.push(`%${search}%`); }
    q += ` ORDER BY cp.difficulty_order ASC, cp.id ASC LIMIT $${i++} OFFSET $${i}`;
    params.push(parseInt(limit), offset);

    const [data, count] = await Promise.all([
      pool.query(q, params),
      pool.query('SELECT COUNT(*) FROM coding_problems WHERE is_active=true'),
    ]);
    res.json({ problems: data.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// ── GET /api/coding/problems/:id ─────────────────────────────────────────────
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
    // Show only non-hidden test cases as samples
    if (p.test_cases) {
      try {
        p.sample_cases = JSON.parse(p.test_cases).filter(tc => !tc.hidden).slice(0, 3);
      } catch { p.sample_cases = []; }
      delete p.test_cases;
    }
    // Parse examples
    if (p.examples && typeof p.examples === 'string') {
      try { p.examples = JSON.parse(p.examples); } catch { p.examples = []; }
    }
    // Parse starter_code
    if (p.starter_code && typeof p.starter_code === 'string') {
      try { p.starter_code = JSON.parse(p.starter_code); } catch {}
    }
    res.json(p);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── GET /api/coding/submissions ──────────────────────────────────────────────
router.get('/submissions', authMiddleware, async (req, res) => {
  const { problem_id } = req.query;
  try {
    let q = `SELECT cs.*, cp.title as problem_title FROM coding_submissions cs
             JOIN coding_problems cp ON cs.problem_id=cp.id WHERE cs.user_id=$1`;
    const params = [req.user.userId];
    if (problem_id) { q += ' AND cs.problem_id=$2'; params.push(problem_id); }
    q += ' ORDER BY cs.submitted_at DESC LIMIT 50';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── GET /api/coding/leaderboard ──────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.username, u.full_name, u.branch,
        COUNT(DISTINCT usp.problem_id) as solved_count,
        SUM(CASE WHEN cp.difficulty='easy' THEN 1 ELSE 0 END) as easy,
        SUM(CASE WHEN cp.difficulty='medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN cp.difficulty='hard' THEN 1 ELSE 0 END) as hard
      FROM users u
      JOIN user_solved_problems usp ON u.user_id=usp.user_id
      JOIN coding_problems cp ON usp.problem_id=cp.id
      WHERE u.is_blocked=false
      GROUP BY u.user_id, u.username, u.full_name, u.branch
      ORDER BY solved_count DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── ADMIN: Problem CRUD ───────────────────────────────────────────────────────
router.post('/admin/problems', authMiddleware, isAdmin, async (req, res) => {
  const { title, description, difficulty, tags, constraints, hints, starter_code, test_cases, examples, companies } = req.body;
  if (!title || !description || !difficulty) return res.status(400).json({ error: 'title, description, difficulty required' });
  const diffOrder = { easy:1, medium:2, hard:3 };
  try {
    const result = await pool.query(
      `INSERT INTO coding_problems (title, description, difficulty, difficulty_order, tags, constraints, hints, starter_code, test_cases, examples, companies, created_by_admin, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,true) RETURNING *`,
      [title, description, difficulty, diffOrder[difficulty]||2, tags||[], constraints||'',
       JSON.stringify(hints||[]), JSON.stringify(starter_code||{}),
       JSON.stringify(test_cases||[]), JSON.stringify(examples||[]), companies||[]]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed: ' + e.message }); }
});

router.put('/admin/problems/:id', authMiddleware, isAdmin, async (req, res) => {
  const { title, description, difficulty, tags, constraints, hints, starter_code, test_cases, examples, companies, is_active } = req.body;
  const diffOrder = { easy:1, medium:2, hard:3 };
  try {
    const result = await pool.query(
      `UPDATE coding_problems SET title=$1, description=$2, difficulty=$3, difficulty_order=$4,
         tags=$5, constraints=$6, hints=$7, starter_code=$8, test_cases=$9, examples=$10,
         companies=$11, is_active=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [title, description, difficulty, diffOrder[difficulty]||2, tags||[], constraints||'',
       JSON.stringify(hints||[]), JSON.stringify(starter_code||{}),
       JSON.stringify(test_cases||[]), JSON.stringify(examples||[]),
       companies||[], is_active!==false, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Problem not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed: ' + e.message }); }
});

router.delete('/admin/problems/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE coding_problems SET is_active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'Problem archived' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/admin/problems', authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*,
         (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id AND status='accepted') as accepted,
         (SELECT COUNT(*) FROM coding_submissions WHERE problem_id=cp.id) as total_submissions
       FROM coding_problems cp ORDER BY cp.created_at DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
