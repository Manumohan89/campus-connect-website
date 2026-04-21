const express = require('express');
const router  = express.Router();
const pool    = require('../db'); // Campus Connect PostgreSQL pool

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Flatten nested faculty rating objects into DB column values */
function flattenBody(body) {
  const {
    overallRating, likedMost,
    reactConfidence, jsUnderstanding, nodeClarity, mongodbConfidence,
    bestTopic, improvementTopic,
    mohanRating, raghavRating, manishRating,
    improvement, suggestions, recommend,
  } = body;

  // Basic required-field validation
  const missing = [];
  if (!overallRating)        missing.push('overallRating');
  if (!likedMost)            missing.push('likedMost');
  if (!reactConfidence)      missing.push('reactConfidence');
  if (!jsUnderstanding)      missing.push('jsUnderstanding');
  if (!nodeClarity)          missing.push('nodeClarity');
  if (!mongodbConfidence)    missing.push('mongodbConfidence');
  if (!bestTopic)            missing.push('bestTopic');
  if (!improvementTopic)     missing.push('improvementTopic');
  if (!mohanRating)          missing.push('mohanRating');
  if (!raghavRating)         missing.push('raghavRating');
  if (!manishRating)         missing.push('manishRating');
  if (recommend === undefined || recommend === null) missing.push('recommend');

  if (missing.length) {
    throw { status: 400, message: `Missing required fields: ${missing.join(', ')}` };
  }

  return {
    overall_rating:     Number(overallRating),
    liked_most:         likedMost,
    react_confidence:   reactConfidence,
    js_understanding:   jsUnderstanding,
    node_clarity:       nodeClarity,
    mongodb_confidence: mongodbConfidence,
    best_topic:         bestTopic,
    improvement_topic:  improvementTopic,
    mohan_knowledge:    Number(mohanRating.knowledge),
    mohan_clarity:      Number(mohanRating.clarity),
    mohan_interaction:  Number(mohanRating.interaction),
    raghav_knowledge:   Number(raghavRating.knowledge),
    raghav_clarity:     Number(raghavRating.clarity),
    raghav_interaction: Number(raghavRating.interaction),
    manish_knowledge:   Number(manishRating.knowledge),
    manish_clarity:     Number(manishRating.clarity),
    manish_interaction: Number(manishRating.interaction),
    improvement:        improvement  || null,
    suggestions:        suggestions  || null,
    recommend:          Boolean(recommend),
  };
}

/** Re-shape a DB row back into the nested shape the frontend expects */
function shapeRow(row) {
  return {
    _id:             row.id,
    overallRating:   row.overall_rating,
    likedMost:       row.liked_most,
    reactConfidence: row.react_confidence,
    jsUnderstanding: row.js_understanding,
    nodeClarity:     row.node_clarity,
    mongodbConfidence: row.mongodb_confidence,
    bestTopic:       row.best_topic,
    improvementTopic: row.improvement_topic,
    mohanRating: {
      knowledge:   row.mohan_knowledge,
      clarity:     row.mohan_clarity,
      interaction: row.mohan_interaction,
    },
    raghavRating: {
      knowledge:   row.raghav_knowledge,
      clarity:     row.raghav_clarity,
      interaction: row.raghav_interaction,
    },
    manishRating: {
      knowledge:   row.manish_knowledge,
      clarity:     row.manish_clarity,
      interaction: row.manish_interaction,
    },
    improvement:  row.improvement,
    suggestions:  row.suggestions,
    recommend:    row.recommend,
    createdAt:    row.created_at,
  };
}

// ── POST /api/workshop-feedback ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const d = flattenBody(req.body);

    const result = await pool.query(
      `INSERT INTO workshop_feedback (
          overall_rating, liked_most,
          react_confidence, js_understanding, node_clarity, mongodb_confidence,
          best_topic, improvement_topic,
          mohan_knowledge, mohan_clarity, mohan_interaction,
          raghav_knowledge, raghav_clarity, raghav_interaction,
          manish_knowledge, manish_clarity, manish_interaction,
          improvement, suggestions, recommend
       ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,
          $9,$10,$11,$12,$13,$14,$15,$16,$17,
          $18,$19,$20
       ) RETURNING id`,
      [
        d.overall_rating, d.liked_most,
        d.react_confidence, d.js_understanding, d.node_clarity, d.mongodb_confidence,
        d.best_topic, d.improvement_topic,
        d.mohan_knowledge, d.mohan_clarity, d.mohan_interaction,
        d.raghav_knowledge, d.raghav_clarity, d.raghav_interaction,
        d.manish_knowledge, d.manish_clarity, d.manish_interaction,
        d.improvement, d.suggestions, d.recommend,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      id: result.rows[0].id,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Workshop feedback POST error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/workshop-feedback ────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rating, recommend, page = 1, limit = 50 } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const values     = [];

    if (rating) {
      values.push(Number(rating));
      conditions.push(`overall_rating = $${values.length}`);
    }
    if (recommend !== undefined && recommend !== '') {
      values.push(recommend === 'true');
      conditions.push(`recommend = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM workshop_feedback ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated rows
    const offset = (Number(page) - 1) * Number(limit);
    values.push(Number(limit), offset);
    const rows = await pool.query(
      `SELECT * FROM workshop_feedback ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    // Aggregate stats (always across full filtered set, not just this page)
    const statsResult = await pool.query(
      `SELECT
          AVG(overall_rating)::NUMERIC(4,2)         AS "avgRating",
          COUNT(*)::INT                              AS "totalResponses",
          SUM(CASE WHEN recommend THEN 1 ELSE 0 END)::INT AS "recommendCount",
          AVG(mohan_knowledge)::NUMERIC(4,2)         AS "avgMohanKnowledge",
          AVG(raghav_knowledge)::NUMERIC(4,2)        AS "avgRaghavKnowledge",
          AVG(manish_knowledge)::NUMERIC(4,2)        AS "avgManishKnowledge"
       FROM workshop_feedback ${where}`,
      conditions.length ? values.slice(0, conditions.length) : []
    );

    return res.json({
      success:   true,
      total,
      page:      Number(page),
      feedbacks: rows.rows.map(shapeRow),
      stats:     statsResult.rows[0] || {},
    });
  } catch (err) {
    console.error('Workshop feedback GET error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/workshop-feedback/:id ───────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workshop_feedback WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, feedback: shapeRow(result.rows[0]) });
  } catch (err) {
    console.error('Workshop feedback GET/:id error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
