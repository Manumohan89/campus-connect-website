const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// ── GET /api/forum/posts ─────────────────────────────────────────────────────
router.get('/posts', authMiddleware, async (req, res) => {
  const { subject, tag, search, sort = 'newest', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let q = `SELECT fp.*, u.username, u.full_name, u.branch,
      (SELECT COUNT(*) FROM forum_answers WHERE post_id = fp.id) as answer_count
      FROM forum_posts fp JOIN users u ON fp.user_id = u.user_id WHERE 1=1`;
    const params = []; let i = 1;
    if (subject) { q += ` AND fp.subject_code = $${i++}`; params.push(subject); }
    if (tag)     { q += ` AND $${i++} = ANY(fp.tags)`; params.push(tag); }
    if (search)  { q += ` AND (fp.title ILIKE $${i++} OR fp.body ILIKE $${i-1})`; params.push(`%${search}%`); }
    if (sort === 'top') q += ' ORDER BY fp.upvotes DESC, fp.created_at DESC';
    else if (sort === 'unanswered') q += ' AND (SELECT COUNT(*) FROM forum_answers WHERE post_id=fp.id)=0 ORDER BY fp.created_at DESC';
    else q += ' ORDER BY fp.created_at DESC';
    q += ` LIMIT $${i++} OFFSET $${i}`;
    params.push(parseInt(limit), offset);
    const countQ = `SELECT COUNT(*) FROM forum_posts WHERE 1=1`;
    const [data, count] = await Promise.all([pool.query(q, params), pool.query(countQ)]);
    res.json({ posts: data.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch posts' }); }
});

// ── GET /api/forum/posts/:id ─────────────────────────────────────────────────
router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE forum_posts SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    const [postRes, answersRes] = await Promise.all([
      pool.query(`SELECT fp.*, u.username, u.full_name, u.branch, u.reputation_points
        FROM forum_posts fp JOIN users u ON fp.user_id = u.user_id WHERE fp.id = $1`, [req.params.id]),
      pool.query(`SELECT fa.*, u.username, u.full_name, u.branch
        FROM forum_answers fa JOIN users u ON fa.user_id = u.user_id
        WHERE fa.post_id = $1 ORDER BY fa.is_accepted DESC, fa.upvotes DESC, fa.created_at ASC`, [req.params.id]),
    ]);
    if (!postRes.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: postRes.rows[0], answers: answersRes.rows });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/forum/posts ────────────────────────────────────────────────────
router.post('/posts', authMiddleware,
  body('title').trim().notEmpty().isLength({ max: 300 }),
  body('body').trim().notEmpty().isLength({ max: 5000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { title, body: postBody, subject_code, tags } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO forum_posts (user_id, title, body, subject_code, tags) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [req.user.userId, title, postBody, subject_code || null, tags || []]
      );
      await pool.query('UPDATE users SET reputation_points = reputation_points + 5 WHERE user_id = $1', [req.user.userId]);
      res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: 'Failed to create post' }); }
});

// ── POST /api/forum/posts/:id/answers ────────────────────────────────────────
router.post('/posts/:id/answers', authMiddleware,
  body('body').trim().notEmpty().isLength({ max: 5000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const result = await pool.query(
        `INSERT INTO forum_answers (post_id, user_id, body) VALUES ($1,$2,$3) RETURNING *`,
        [req.params.id, req.user.userId, req.body.body]
      );
      await pool.query('UPDATE users SET reputation_points = reputation_points + 10 WHERE user_id = $1', [req.user.userId]);
      // Notify post author
      const post = await pool.query('SELECT user_id, title FROM forum_posts WHERE id=$1', [req.params.id]);
      if (post.rows[0]?.user_id !== req.user.userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
          [post.rows[0].user_id, 'announcement', '💬 New answer on your post',
           `Someone answered your question: "${post.rows[0].title.substring(0,60)}"`,
           `/forum/${req.params.id}`]
        );
      }
      res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: 'Failed to post answer' }); }
});

// ── PATCH /api/forum/answers/:id/accept ─────────────────────────────────────
router.patch('/answers/:id/accept', authMiddleware, async (req, res) => {
  try {
    const ans = await pool.query('SELECT fa.*, fp.user_id as post_author FROM forum_answers fa JOIN forum_posts fp ON fa.post_id=fp.id WHERE fa.id=$1', [req.params.id]);
    if (!ans.rows.length) return res.status(404).json({ error: 'Answer not found' });
    if (ans.rows[0].post_author !== req.user.userId) return res.status(403).json({ error: 'Only post author can accept' });
    await pool.query('UPDATE forum_answers SET is_accepted=false WHERE post_id=$1', [ans.rows[0].post_id]);
    await pool.query('UPDATE forum_answers SET is_accepted=true WHERE id=$1', [req.params.id]);
    await pool.query('UPDATE forum_posts SET is_solved=true WHERE id=$1', [ans.rows[0].post_id]);
    await pool.query('UPDATE users SET reputation_points=reputation_points+15 WHERE user_id=$1', [ans.rows[0].user_id]);
    res.json({ message: 'Answer accepted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/forum/vote ─────────────────────────────────────────────────────
router.post('/vote', authMiddleware, async (req, res) => {
  const { target_id, target_type, vote } = req.body;
  if (!['post','answer'].includes(target_type) || ![1,-1].includes(parseInt(vote)))
    return res.status(400).json({ error: 'Invalid vote parameters' });
  try {
    await pool.query(
      `INSERT INTO forum_votes (user_id, target_id, target_type, vote) VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, target_id, target_type) DO UPDATE SET vote=EXCLUDED.vote`,
      [req.user.userId, target_id, target_type, parseInt(vote)]
    );
    // Use explicit table names (no string interpolation) to prevent SQL injection
    const total = await pool.query(
      `SELECT COALESCE(SUM(vote),0) as total FROM forum_votes WHERE target_id=$1 AND target_type=$2`,
      [target_id, target_type]
    );
    const upvotes = parseInt(total.rows[0].total);
    if (target_type === 'post') {
      await pool.query('UPDATE forum_posts SET upvotes=$1 WHERE id=$2', [upvotes, target_id]);
    } else {
      await pool.query('UPDATE forum_answers SET upvotes=$1 WHERE id=$2', [upvotes, target_id]);
    }
    res.json({ upvotes: parseInt(total.rows[0].total) });
  } catch (e) { res.status(500).json({ error: 'Failed to vote' }); }
});

// ── GET /api/forum/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [posts, answers, solved] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM forum_posts'),
      pool.query('SELECT COUNT(*) FROM forum_answers'),
      pool.query('SELECT COUNT(*) FROM forum_posts WHERE is_solved=true'),
    ]);
    res.json({
      total_posts: parseInt(posts.rows[0].count),
      total_answers: parseInt(answers.rows[0].count),
      solved: parseInt(solved.rows[0].count),
    });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
