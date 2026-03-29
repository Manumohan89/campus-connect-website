const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const { validate, notificationRules } = require('../middleware/validate');

// All admin routes require BOTH auth + admin role
router.use(authMiddleware, isAdmin);

// ══════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════════

router.get('/stats', async (req, res) => {
  try {
    const [users, courses, resources, placements, community, enrollments] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE role='admin') as admins, COUNT(*) FILTER (WHERE is_blocked) as blocked, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week FROM users"),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE category=$1) as backlog, COUNT(*) FILTER (WHERE category=$2) as upskill FROM training_courses', ['backlog_clearing','upskill']),
      pool.query('SELECT COUNT(*) as total FROM vtu_resources'),
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='open') as open FROM placement_drives"),
      pool.query('SELECT COUNT(*) as total FROM community_resources'),
      pool.query('SELECT COUNT(*) as total FROM enrollments'),
    ]);
    res.json({
      users: users.rows[0],
      courses: courses.rows[0],
      resources: resources.rows[0],
      placements: placements.rows[0],
      community: community.rows[0],
      enrollments: enrollments.rows[0],
    });
  } catch (e) {
    console.error('Admin stats error:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ══════════════════════════════════════════════════════════════════
// USERS MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET all users with pagination + search
router.get('/users', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [`%${search}%`, `%${search}%`];
    let roleFilter = '';
    if (role) { roleFilter = ` AND role = $${params.length + 1}`; params.push(role); }

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM users WHERE (username ILIKE $1 OR email ILIKE $2 OR full_name ILIKE $1)${roleFilter}`,
      params
    );
    params.push(parseInt(limit), offset);
    const dataRes = await pool.query(
      `SELECT user_id, username, email, full_name, branch, semester, college, role, is_blocked, cgpa, sgpa, created_at
       FROM users
       WHERE (username ILIKE $1 OR email ILIKE $2 OR full_name ILIKE $1)${roleFilter}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ users: dataRes.rows, total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    console.error('Admin users error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user with their marks + enrollments
router.get('/users/:id', async (req, res) => {
  try {
    const [userRes, marksRes, enrollRes] = await Promise.all([
      pool.query('SELECT user_id, username, email, full_name, branch, semester, college, mobile, year_scheme, role, is_blocked, cgpa, sgpa, created_at FROM users WHERE user_id=$1', [req.params.id]),
      pool.query('SELECT subject_code, subject_name, internal_marks, external_marks, total, grade_points, credits FROM marks WHERE user_id=$1', [req.params.id]),
      pool.query('SELECT tc.title, tc.category, e.progress, e.enrolled_at, e.certificate_issued FROM enrollments e JOIN training_courses tc ON e.course_id=tc.course_id WHERE e.user_id=$1', [req.params.id]),
    ]);
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userRes.rows[0], marks: marksRes.rows, enrollments: enrollRes.rows });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// PATCH block/unblock user
router.patch('/users/:id/block', async (req, res) => {
  try {
    // Prevent admin from blocking themselves
    if (parseInt(req.params.id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot block your own account' });
    }
    const result = await pool.query(
      'UPDATE users SET is_blocked = NOT is_blocked WHERE user_id=$1 RETURNING user_id, username, is_blocked',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: result.rows[0].is_blocked ? 'User blocked' : 'User unblocked', user: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PATCH change user role
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  try {
    if (parseInt(req.params.id) === req.user.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE user_id=$2 RETURNING user_id, username, role',
      [role, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `Role updated to ${role}`, user: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM users WHERE user_id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ══════════════════════════════════════════════════════════════════
// TRAINING COURSES MANAGEMENT (reuses training_courses table)
// ══════════════════════════════════════════════════════════════════

router.get('/training', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tc.*, 
        (SELECT COUNT(*) FROM enrollments WHERE course_id=tc.course_id) as enrollment_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id=tc.course_id AND certificate_issued=true) as certificates_issued
      FROM training_courses tc ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch courses' }); }
});

router.post('/training', async (req, res) => {
  const { title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours, is_free, has_certificate, course_url } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'title and category required' });
  try {
    const result = await pool.query(
      `INSERT INTO training_courses (title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours, is_free, has_certificate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours || 0, is_free !== false, has_certificate !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to create course' }); }
});

router.put('/training/:id', async (req, res) => {
  const { title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours, is_free, has_certificate, course_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE training_courses SET title=$1, description=$2, category=$3, subject_code=$4, department=$5, semester=$6, year_scheme=$7, instructor=$8, duration_hours=$9, is_free=$10, has_certificate=$11, course_url=$12
       WHERE course_id=$13 RETURNING *`,
      [title, description, category, subject_code, department, semester, year_scheme, instructor, duration_hours || 0, is_free !== false, has_certificate !== false, course_url || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update course' }); }
});

router.delete('/training/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM training_courses WHERE course_id=$1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete course' }); }
});

// ══════════════════════════════════════════════════════════════════
// VTU RESOURCES MANAGEMENT (reuses vtu_resources table)
// ══════════════════════════════════════════════════════════════════

router.get('/resources', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vtu_resources ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch resources' }); }
});

router.post('/resources', async (req, res) => {
  const { title, resource_type, subject_code, subject_name, department, semester, year_scheme, file_url, source } = req.body;
  if (!title || !resource_type || !subject_name || !department || !semester || !year_scheme || !file_url)
    return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = await pool.query(
      `INSERT INTO vtu_resources (title, resource_type, subject_code, subject_name, department, semester, year_scheme, file_url, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, resource_type, subject_code, subject_name, department, parseInt(semester), year_scheme, file_url, source || 'Admin']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to create resource' }); }
});

router.put('/resources/:id', async (req, res) => {
  const { title, resource_type, subject_code, subject_name, department, semester, year_scheme, file_url, source } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vtu_resources SET title=$1, resource_type=$2, subject_code=$3, subject_name=$4, department=$5, semester=$6, year_scheme=$7, file_url=$8, source=$9
       WHERE resource_id=$10 RETURNING *`,
      [title, resource_type, subject_code, subject_name, department, parseInt(semester), year_scheme, file_url, source, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Resource not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update resource' }); }
});

router.delete('/resources/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vtu_resources WHERE resource_id=$1', [req.params.id]);
    res.json({ message: 'Resource deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete resource' }); }
});

// ══════════════════════════════════════════════════════════════════
// PLACEMENT DRIVES MANAGEMENT (reuses placement_drives table)
// ══════════════════════════════════════════════════════════════════

router.get('/placements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pd.*, 
        (SELECT COUNT(*) FROM placement_applications WHERE drive_id=pd.drive_id) as application_count
      FROM placement_drives pd ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch drives' }); }
});

router.post('/placements', async (req, res) => {
  const { company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline, eligible_branches, min_cgpa, eligible_backlogs, description, apply_link, drive_type, status, location } = req.body;
  if (!company_name || !role) return res.status(400).json({ error: 'company_name and role required' });
  try {
    const result = await pool.query(
      `INSERT INTO placement_drives (company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline, eligible_branches, min_cgpa, eligible_backlogs, description, apply_link, drive_type, status, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline,
       eligible_branches || [], min_cgpa || 6.0, eligible_backlogs || 0, description, apply_link,
       drive_type || 'campus', status || 'upcoming', location]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to create drive' }); }
});

router.put('/placements/:id', async (req, res) => {
  const { company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline, eligible_branches, min_cgpa, eligible_backlogs, description, apply_link, drive_type, status, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE placement_drives SET company_name=$1, role=$2, package_lpa=$3, package_max_lpa=$4, drive_date=$5, registration_deadline=$6, eligible_branches=$7, min_cgpa=$8, eligible_backlogs=$9, description=$10, apply_link=$11, drive_type=$12, status=$13, location=$14
       WHERE drive_id=$15 RETURNING *`,
      [company_name, role, package_lpa, package_max_lpa, drive_date, registration_deadline,
       eligible_branches || [], min_cgpa || 6.0, eligible_backlogs || 0, description, apply_link,
       drive_type || 'campus', status || 'upcoming', location, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Drive not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update drive' }); }
});

router.delete('/placements/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM placement_drives WHERE drive_id=$1', [req.params.id]);
    res.json({ message: 'Drive deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete drive' }); }
});

// ══════════════════════════════════════════════════════════════════
// COMMUNITY RESOURCES (admin moderate)
// ══════════════════════════════════════════════════════════════════

router.get('/community', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, u.username, u.full_name as uploader_name
      FROM community_resources cr
      JOIN users u ON cr.user_id = u.user_id
      ORDER BY cr.uploaded_at DESC`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch community resources' }); }
});

router.patch('/community/:id/approve', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE community_resources SET is_approved = NOT is_approved WHERE id=$1 RETURNING id, title, is_approved',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: result.rows[0].is_approved ? 'Approved' : 'Unapproved', resource: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/community/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM community_resources WHERE id=$1', [req.params.id]);
    res.json({ message: 'Community resource deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ══════════════════════════════════════════════════════════════════
// ALUMNI MANAGEMENT (reuses alumni table)
// ══════════════════════════════════════════════════════════════════

router.get('/alumni', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alumni ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch alumni' }); }
});

router.post('/alumni', async (req, res) => {
  const { full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills, is_available, college } = req.body;
  if (!full_name || !email || !branch || !graduation_year) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = await pool.query(
      `INSERT INTO alumni (full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills, is_available, college)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills || [], is_available !== false, college]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to add alumni' }); }
});

router.put('/alumni/:id', async (req, res) => {
  const { full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills, is_available, college } = req.body;
  try {
    const result = await pool.query(
      `UPDATE alumni SET full_name=$1, email=$2, branch=$3, graduation_year=$4, current_company=$5, current_role=$6, linkedin_url=$7, bio=$8, skills=$9, is_available=$10, college=$11
       WHERE id=$12 RETURNING *`,
      [full_name, email, branch, graduation_year, current_company, current_role, linkedin_url, bio, skills || [], is_available !== false, college, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Alumni not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update alumni' }); }
});

router.delete('/alumni/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM alumni WHERE id=$1', [req.params.id]);
    res.json({ message: 'Alumni deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete alumni' }); }
});

// ══════════════════════════════════════════════════════════════════
// CONTACT MESSAGES (admin inbox)
// ══════════════════════════════════════════════════════════════════

router.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});


// ══════════════════════════════════════════════════════════════════
// ADMIN ANALYTICS & ADVANCED STATS
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/analytics - deep analytics
router.get('/analytics', async (req, res) => {
  try {
    const [
      cgpaDistrib, branchStats, topPerformers,
      recentUploads, coursePopularity, placementStats,
      monthlySignups, activeUsers
    ] = await Promise.all([
      pool.query(`SELECT
        CASE WHEN cgpa >= 9 THEN '9-10' WHEN cgpa >= 8 THEN '8-9'
             WHEN cgpa >= 7 THEN '7-8' WHEN cgpa >= 6 THEN '6-7'
             WHEN cgpa >= 5 THEN '5-6' ELSE 'Below 5' END as range,
        COUNT(*) as count
        FROM users WHERE cgpa > 0 GROUP BY 1 ORDER BY 1 DESC`),
      pool.query(`SELECT branch, COUNT(*) as count, AVG(cgpa) as avg_cgpa
        FROM users WHERE branch IS NOT NULL GROUP BY branch ORDER BY count DESC LIMIT 10`),
      pool.query(`SELECT username, full_name, cgpa, branch, semester
        FROM users WHERE cgpa > 0 ORDER BY cgpa DESC LIMIT 10`),
      pool.query(`SELECT DATE(updated_on) as date, COUNT(*) as uploads
        FROM marks WHERE updated_on > NOW() - INTERVAL '30 days'
        GROUP BY DATE(updated_on) ORDER BY date`),
      pool.query(`SELECT tc.title, COUNT(e.enrollment_id) as enrollments,
        AVG(e.progress) as avg_progress
        FROM training_courses tc LEFT JOIN enrollments e ON tc.course_id = e.course_id
        GROUP BY tc.course_id, tc.title ORDER BY enrollments DESC LIMIT 10`),
      pool.query(`SELECT company_name, role, package_lpa,
        COUNT(a.application_id) as applications, status
        FROM placement_drives pd
        LEFT JOIN placement_applications a ON pd.drive_id = a.drive_id
        GROUP BY pd.drive_id, company_name, role, package_lpa, status
        ORDER BY applications DESC LIMIT 10`),
      pool.query(`SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as signups
        FROM users WHERE created_at > NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM') ORDER BY month`),
      pool.query(`SELECT COUNT(DISTINCT user_id) as count
        FROM marks WHERE updated_on > NOW() - INTERVAL '7 days'`),
    ]);
    res.json({
      cgpa_distribution: cgpaDistrib.rows,
      branch_stats: branchStats.rows,
      top_performers: topPerformers.rows,
      recent_uploads: recentUploads.rows,
      course_popularity: coursePopularity.rows,
      placement_stats: placementStats.rows,
      monthly_signups: monthlySignups.rows,
      active_users_week: activeUsers.rows[0]?.count || 0,
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ══════════════════════════════════════════════════════════════════
// BULK NOTIFICATIONS (broadcast to all / by branch)
// ══════════════════════════════════════════════════════════════════

// POST /api/admin/notify - send notification to users
router.post('/notify', validate(notificationRules), async (req, res) => {
  const { title, body, link, type = 'announcement', target = 'all', branch } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body required' });
  try {
    let userQuery = 'SELECT user_id FROM users WHERE is_blocked = false';
    const params = [];
    if (target === 'branch' && branch) {
      userQuery += ' AND branch = $1';
      params.push(branch);
    }
    const users = await pool.query(userQuery, params);
    let sent = 0;
    for (const u of users.rows) {
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
        [u.user_id, type, title, body, link || null]
      );
      sent++;
    }
    res.json({ message: `Notification sent to ${sent} users`, sent });
  } catch (e) {
    console.error('Broadcast error:', e);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// ══════════════════════════════════════════════════════════════════
// MARKS MANAGEMENT (admin can view all students marks)
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/marks?user_id=xxx
router.get('/marks', async (req, res) => {
  const { user_id, branch, failed_only } = req.query;
  try {
    let q = `SELECT m.*, u.full_name, u.username, u.branch
      FROM marks m JOIN users u ON m.user_id = u.user_id WHERE 1=1`;
    const params = [];
    let i = 1;
    if (user_id) { q += ` AND m.user_id = $${i++}`; params.push(user_id); }
    if (branch) { q += ` AND u.branch = $${i++}`; params.push(branch); }
    if (failed_only === 'true') { q += ` AND m.total < 40`; }
    q += ' ORDER BY m.updated_on DESC LIMIT 500';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ══════════════════════════════════════════════════════════════════
// CERTIFICATES MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/certificates
router.get('/certificates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.certificate_id, e.completed_at, u.full_name, u.username, u.branch,
        tc.title as course_title, tc.category
      FROM enrollments e
      JOIN users u ON e.user_id = u.user_id
      JOIN training_courses tc ON e.course_id = tc.course_id
      WHERE e.certificate_issued = true
      ORDER BY e.completed_at DESC LIMIT 200
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ══════════════════════════════════════════════════════════════════
// SYSTEM SETTINGS
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/system-info
router.get('/system-info', async (req, res) => {
  try {
    const [dbSize, tableCount, lastBackup] = await Promise.all([
      pool.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size"),
      pool.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema='public'"),
      pool.query("SELECT NOW() as checked_at"),
    ]);
    res.json({
      db_size: dbSize.rows[0]?.size,
      table_count: tableCount.rows[0]?.count,
      checked_at: lastBackup.rows[0]?.checked_at,
      node_version: process.version,
      uptime_hours: Math.floor(process.uptime() / 3600),
    });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});


// POST /api/admin/certificates/approve/:enrollmentId — admin issues certificate
router.post('/certificates/approve/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    // Generate unique certificate ID
    const certId = 'CC-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2,8).toUpperCase();
    const result = await pool.query(
      `UPDATE enrollments SET certificate_issued=true, certificate_id=$1, completed_at=NOW(), progress=100
       WHERE id=$2 RETURNING *, (SELECT user_id FROM enrollments WHERE id=$2) as uid`,
      [certId, enrollmentId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Enrollment not found' });
    // Notify user
    const enr = result.rows[0];
    const courseRes = await pool.query('SELECT title FROM training_courses WHERE course_id=$1', [enr.course_id]);
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
      [enr.user_id, 'announcement',
       '🎓 Certificate Issued!',
       `Your certificate for "${courseRes.rows[0]?.title}" has been approved by admin.`,
       `/certificate/${certId}`]
    );
    res.json({ message: 'Certificate issued', certificate_id: certId });
  } catch (e) {
    console.error('Cert approve error:', e);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// GET /api/admin/certificates/pending — list enrollments eligible for certificates
router.get('/certificates/pending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id as enrollment_id, e.user_id, e.course_id, e.progress, e.enrolled_at,
        u.full_name, u.username, u.branch, u.semester,
        tc.title as course_title, tc.category, tc.has_certificate
      FROM enrollments e
      JOIN users u ON e.user_id = u.user_id
      JOIN training_courses tc ON e.course_id = tc.course_id
      WHERE e.certificate_issued = false AND tc.has_certificate = true AND e.progress >= 80
      ORDER BY e.enrolled_at DESC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});


// POST /api/admin/resources/:id/upload — upload actual file for a resource
const resourceUpload = require('multer')({
  storage: require('multer').diskStorage({
    destination: require('path').join(__dirname, '../uploads/resources'),
    filename: (req, file, cb) => cb(null, `resource-${req.params.id}-${Date.now()}${require('path').extname(file.originalname)}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only PDF, DOC, PPT, and image files allowed'));
  },
});

router.post('/resources/:id/upload', resourceUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const fs = require('fs');
    const uploadDir = require('path').join(__dirname, '../uploads/resources');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const fileUrl = `/uploads/resources/${req.file.filename}`;
    await pool.query('UPDATE vtu_resources SET file_url=$1 WHERE resource_id=$2', [fileUrl, req.params.id]);
    res.json({ file_url: fileUrl, message: 'File uploaded successfully' });
  } catch (e) {
    console.error('Resource upload error:', e);
    res.status(500).json({ error: 'Failed to save file' });
  }
});
// ── FORUM MODERATION ─────────────────────────────────────────────────────────
router.delete('/forum/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM forum_posts WHERE id=$1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete post' }); }
});

// ── PAYMENTS ADMIN ────────────────────────────────────────────────────────────
router.get('/payments/subscriptions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.username, u.email, u.full_name, u.branch
       FROM subscriptions s JOIN users u ON s.user_id=u.user_id
       ORDER BY s.created_at DESC LIMIT 200`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch subscriptions' }); }
});

router.get('/payments/logs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pl.*, u.username FROM payment_logs pl
       LEFT JOIN users u ON pl.user_id=u.user_id
       ORDER BY pl.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── JOB LISTINGS ADMIN ────────────────────────────────────────────────────────
router.get('/jobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_listings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/jobs', async (req, res) => {
  const { title, company, description, type, location, tags, link, min_cgpa, eligible_branches, deadline, is_active } = req.body;
  if (!title || !company || !link) return res.status(400).json({ error: 'Title, company and link required' });
  try {
    const result = await pool.query(
      `INSERT INTO job_listings (title, company, description, type, location, tags, link, min_cgpa, eligible_branches, deadline, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, company, description||'', type||'Full-time', location||'Bengaluru',
       tags||[], link, parseFloat(min_cgpa)||0, eligible_branches||[], deadline||null, is_active!==false]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create job' }); }
});

router.put('/jobs/:id', async (req, res) => {
  const { title, company, description, type, location, tags, link, min_cgpa, eligible_branches, deadline, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE job_listings SET title=$1, company=$2, description=$3, type=$4, location=$5,
       tags=$6, link=$7, min_cgpa=$8, eligible_branches=$9, deadline=$10, is_active=$11
       WHERE id=$12 RETURNING *`,
      [title, company, description||'', type||'Full-time', location||'Bengaluru',
       tags||[], link, parseFloat(min_cgpa)||0, eligible_branches||[], deadline||null, is_active!==false, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_listings WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

module.exports = router;
