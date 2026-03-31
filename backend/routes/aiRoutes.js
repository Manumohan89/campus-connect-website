const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const https = require('https');

// ── Helpers ───────────────────────────────────────────────────────────────────

// Check daily usage limit for free users
async function checkDailyLimit(userId, feature, freeLimit) {
  try {
    const result = await pool.query(
      `SELECT subscription_tier, subscription_expires_at FROM users WHERE user_id=$1`,
      [userId]
    );
    const user = result.rows[0];
    const isPremium = user?.subscription_tier === 'premium' &&
                      new Date(user?.subscription_expires_at) > new Date();
    if (isPremium) return { allowed: true, remaining: Infinity, premium: true };

    // Count today's usage
    const today = new Date().toISOString().split('T')[0];
    const usage = await pool.query(
      `SELECT COUNT(*) FROM ai_usage_log WHERE user_id=$1 AND feature=$2 AND DATE(created_at)=$3`,
      [userId, feature, today]
    );
    const count = parseInt(usage.rows[0].count);
    return {
      allowed: count < freeLimit,
      remaining: Math.max(0, freeLimit - count),
      count,
      limit: freeLimit,
      premium: false,
    };
  } catch (e) {
    return { allowed: true, remaining: 5 }; // fail open
  }
}

// Log AI usage
async function logUsage(userId, feature) {
  try {
    await pool.query(
      'INSERT INTO ai_usage_log (user_id, feature) VALUES ($1,$2)',
      [userId, feature]
    );
  } catch {}
}

// Call Anthropic Claude API (streaming-friendly, no SDK needed)
async function callClaude(systemPrompt, messages, stream = false) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-ant-xxx')) {
    throw new Error('ANTHROPIC_API_KEY not configured. Get a free key at console.anthropic.com');
  }

  const body = JSON.stringify({
    model: 'claude-3-haiku-20240307', // Cheapest Claude model - ideal for tutoring
    max_tokens: 1024,
    system: systemPrompt,
    messages,
    stream,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        } catch (e) { reject(new Error('Failed to parse Claude response')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Build context-aware system prompt
function buildSystemPrompt(user) {
  return `You are an expert VTU (Visvesvaraya Technological University) study assistant. You help students understand subjects clearly with step-by-step explanations.

Student context:
- Branch: ${user.branch || 'Engineering'}
- Semester: ${user.semester || 'Not specified'}
- Scheme: ${user.year_scheme || '2022'}
- Name: ${user.full_name || 'Student'}

Guidelines:
1. Give clear, structured answers with numbered steps when explaining processes
2. Use simple language appropriate for undergraduate engineering students
3. Include relevant examples from VTU exam perspective
4. For mathematical problems, show each step clearly
5. Keep answers focused and exam-relevant
6. When relevant, mention which VTU subjects this topic appears in
7. End with a quick summary or "Key points to remember"

Always be encouraging and supportive. Students may be stressed about exams.`;
}

// ── Create tables if not exist ────────────────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_code TEXT,
    title TEXT,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS ai_usage_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_log(user_id, feature, created_at);
  CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_chat_sessions(user_id);
`).catch(() => {});

// ── POST /api/ai/ask ──────────────────────────────────────────────────────────
router.post('/ask', authMiddleware, async (req, res) => {
  const { question, subject_code, session_id, context = [] } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'Question is required' });

  // Check daily limit: 5 for free, unlimited for premium
  const limit = await checkDailyLimit(req.user.userId, 'ai_tutor', 5);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Daily limit reached (${limit.limit} questions/day on free plan). Upgrade to Premium for unlimited AI tutoring.`,
      code: 'LIMIT_REACHED',
      limit: limit.limit,
      upgrade_url: '/premium',
    });
  }

  try {
    // Get user info for context
    const userResult = await pool.query(
      'SELECT full_name, branch, semester, year_scheme FROM users WHERE user_id=$1',
      [req.user.userId]
    );
    const user = userResult.rows[0] || {};
    const systemPrompt = buildSystemPrompt(user);

    // Build messages array (include context from this session)
    const messages = [
      ...context.slice(-6), // last 6 messages for context (3 exchanges)
      { role: 'user', content: question.trim() }
    ];

    const response = await callClaude(systemPrompt, messages);
    const answer = response.content?.[0]?.text || 'Sorry, I could not generate a response.';

    // Log usage
    await logUsage(req.user.userId, 'ai_tutor');

    // Save/update session
    let sessionId = session_id;
    if (sessionId) {
      // Append to existing session
      const sess = await pool.query('SELECT messages FROM ai_chat_sessions WHERE id=$1 AND user_id=$2', [sessionId, req.user.userId]);
      if (sess.rows.length) {
        const msgs = sess.rows[0].messages || [];
        msgs.push({ role: 'user', content: question });
        msgs.push({ role: 'assistant', content: answer });
        // Keep last 40 messages
        const trimmed = msgs.slice(-40);
        await pool.query('UPDATE ai_chat_sessions SET messages=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(trimmed), sessionId]);
      }
    } else {
      // Create new session
      const title = question.substring(0, 60) + (question.length > 60 ? '...' : '');
      const newSession = await pool.query(
        'INSERT INTO ai_chat_sessions (user_id, subject_code, title, messages) VALUES ($1,$2,$3,$4) RETURNING id',
        [req.user.userId, subject_code || null, title, JSON.stringify([
          { role: 'user', content: question },
          { role: 'assistant', content: answer },
        ])]
      );
      sessionId = newSession.rows[0].id;
    }

    res.json({
      answer,
      session_id: sessionId,
      remaining: limit.premium ? null : limit.remaining - 1,
      premium: limit.premium,
    });

  } catch (e) {
    console.error('AI tutor error:', e.message);
    if (e.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({
        error: 'AI tutor not configured. Admin needs to add ANTHROPIC_API_KEY.',
        code: 'NO_API_KEY',
      });
    }
    res.status(500).json({ error: 'AI tutor is temporarily unavailable. Please try again.' });
  }
});

// ── GET /api/ai/sessions ──────────────────────────────────────────────────────
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, subject_code, title, created_at, updated_at FROM ai_chat_sessions WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 20',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// ── GET /api/ai/sessions/:id ──────────────────────────────────────────────────
router.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_chat_sessions WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── DELETE /api/ai/sessions/:id ───────────────────────────────────────────────
router.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_chat_sessions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ message: 'Session deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── GET /api/ai/usage ─────────────────────────────────────────────────────────
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT COUNT(*) FROM ai_usage_log WHERE user_id=$1 AND feature=$2 AND DATE(created_at)=$3',
      [req.user.userId, 'ai_tutor', today]
    );
    const userResult = await pool.query(
      'SELECT subscription_tier, subscription_expires_at FROM users WHERE user_id=$1',
      [req.user.userId]
    );
    const user = userResult.rows[0];
    const isPremium = user?.subscription_tier === 'premium' && new Date(user?.subscription_expires_at) > new Date();
    res.json({
      used: parseInt(result.rows[0].count),
      limit: isPremium ? null : 5,
      premium: isPremium,
      remaining: isPremium ? null : Math.max(0, 5 - parseInt(result.rows[0].count)),
    });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/ai/interview-evaluate ──────────────────────────────────────────
router.post('/interview-evaluate', authMiddleware, async (req, res) => {
  const { question, answer, company, type } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });

  const limit = await checkDailyLimit(req.user.userId, 'interview_eval', 10);
  if (!limit.allowed) {
    return res.status(429).json({ error: 'Daily limit reached. Upgrade to Premium for unlimited practice.', code: 'LIMIT_REACHED' });
  }

  try {
    const systemPrompt = `You are an expert HR interviewer and career coach specializing in campus placements at Indian IT companies like ${company || 'TCS, Infosys, Wipro'}. Evaluate interview answers critically but constructively.`;

    const evalPrompt = `Interview Question: "${question}"
Type: ${type || 'HR'}

Candidate's Answer: "${answer}"

Evaluate this answer and respond ONLY in this exact JSON format:
{
  "overall_score": <1-10>,
  "clarity": <1-10>,
  "content": <1-10>,
  "confidence": <1-10>,
  "what_was_good": ["point 1", "point 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "better_answer": "A 2-3 sentence improved version of the answer",
  "star_format_used": <true/false>,
  "tip": "One key tip for this type of question"
}`;

    const response = await callClaude(systemPrompt, [{ role: 'user', content: evalPrompt }]);
    const text = response.content?.[0]?.text || '{}';

    let evaluation;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : { overall_score: 5, error: 'Could not parse evaluation' };
    } catch {
      evaluation = { overall_score: 5, error: 'Could not parse evaluation', raw: text };
    }

    await logUsage(req.user.userId, 'interview_eval');
    res.json(evaluation);

  } catch (e) {
    console.error('Interview eval error:', e.message);
    if (e.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'AI not configured. Add ANTHROPIC_API_KEY to enable.', code: 'NO_API_KEY' });
    }
    res.status(500).json({ error: 'Evaluation failed. Please try again.' });
  }
});

// ── GET /api/ai/interview-questions ──────────────────────────────────────────
router.get('/interview-questions', authMiddleware, async (req, res) => {
  const { company = 'General', type = 'hr' } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM interview_questions
       WHERE (company=$1 OR company='General') AND type=$2
       ORDER BY RANDOM() LIMIT 10`,
      [company, type]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch questions' }); }
});

module.exports = router;
