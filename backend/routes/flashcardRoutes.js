const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// SM-2 spaced repetition algorithm
function sm2(card, quality) { // quality: 0-4 (0=complete fail, 4=perfect)
  let { ease_factor, interval_days, repetitions } = card;
  if (quality < 2) { repetitions = 0; interval_days = 1; }
  else {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions++;
  }
  ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const next = new Date(); next.setDate(next.getDate() + interval_days);
  return { ease_factor, interval_days, repetitions, next_review: next.toISOString().split('T')[0] };
}

// ── GET /api/flashcards/decks ────────────────────────────────────────────────
router.get('/decks', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fd.*, 
        (SELECT COUNT(*) FROM flashcards WHERE deck_id=fd.id AND next_review<=CURRENT_DATE) as due_count
       FROM flashcard_decks fd WHERE fd.user_id=$1 ORDER BY fd.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/flashcards/decks ───────────────────────────────────────────────
router.post('/decks', authMiddleware, async (req, res) => {
  const { title, subject_code, cards } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  try {
    const deck = await pool.query(
      'INSERT INTO flashcard_decks (user_id, subject_code, title) VALUES ($1,$2,$3) RETURNING *',
      [req.user.userId, subject_code || null, title]
    );
    if (cards?.length > 0) {
      for (const card of cards) {
        await pool.query('INSERT INTO flashcards (deck_id, front, back) VALUES ($1,$2,$3)', [deck.rows[0].id, card.front, card.back]);
      }
      await pool.query('UPDATE flashcard_decks SET card_count=$1 WHERE id=$2', [cards.length, deck.rows[0].id]);
    }
    res.status(201).json({ ...deck.rows[0], card_count: cards?.length || 0 });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── GET /api/flashcards/decks/:id/review ────────────────────────────────────
router.get('/decks/:id/review', authMiddleware, async (req, res) => {
  try {
    const deck = await pool.query('SELECT * FROM flashcard_decks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    if (!deck.rows.length) return res.status(404).json({ error: 'Deck not found' });
    const cards = await pool.query(
      'SELECT * FROM flashcards WHERE deck_id=$1 AND next_review<=CURRENT_DATE ORDER BY next_review ASC LIMIT 20',
      [req.params.id]
    );
    res.json({ deck: deck.rows[0], cards: cards.rows, total_due: cards.rows.length });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/flashcards/:cardId/review ─────────────────────────────────────
router.post('/:cardId/review', authMiddleware, async (req, res) => {
  const { quality } = req.body; // 0-4
  try {
    const card = await pool.query('SELECT * FROM flashcards WHERE id=$1', [req.params.cardId]);
    if (!card.rows.length) return res.status(404).json({ error: 'Card not found' });
    const updated = sm2(card.rows[0], parseInt(quality));
    await pool.query(
      'UPDATE flashcards SET ease_factor=$1, interval_days=$2, repetitions=$3, next_review=$4, last_reviewed=NOW() WHERE id=$5',
      [updated.ease_factor, updated.interval_days, updated.repetitions, updated.next_review, req.params.cardId]
    );
    res.json({ ...updated, card_id: req.params.cardId });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── GET /api/flashcards/today ────────────────────────────────────────────────
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, fd.title as deck_title, fd.subject_code
       FROM flashcards f JOIN flashcard_decks fd ON f.deck_id=fd.id
       WHERE fd.user_id=$1 AND f.next_review<=CURRENT_DATE
       ORDER BY f.next_review ASC LIMIT 50`,
      [req.user.userId]
    );
    res.json({ cards: result.rows, count: result.rows.length });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
