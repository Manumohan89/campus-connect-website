/**
 * notificationService.js
 * Central place to create in-app notifications for users.
 * Called automatically when key events happen (new drive, backlog alert, marks uploaded).
 */
const pool = require('../db');

async function createNotification(userId, type, title, body, link = null) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
      [userId, type, title, body, link]
    );
  } catch (e) {
    console.error('Failed to create notification:', e.message);
  }
}

// Called after marks are uploaded
async function notifyMarksUploaded(userId, sgpa, failedCount) {
  await createNotification(userId, 'marks',
    `📊 Marks uploaded — SGPA: ${sgpa}`,
    failedCount > 0
      ? `You have ${failedCount} failed subject(s). Check the Backlog Dashboard for free clearing courses.`
      : `Your SGPA is ${sgpa}. Visit Analytics to see your performance breakdown.`,
    failedCount > 0 ? '/backlog-dashboard' : '/analytics'
  );
  if (failedCount > 0) {
    await createNotification(userId, 'backlog',
      `⚠️ ${failedCount} backlog(s) detected`,
      'Free backlog clearing courses are available. Enroll now to clear them before the next exam.',
      '/training'
    );
  }
}

// Called when a new placement drive is added (broadcast to eligible students)
async function notifyNewPlacementDrive(companyName, role, minCgpa, eligibleBranches) {
  try {
    // Notify users who are eligible
    const conditions = [];
    const params = [minCgpa];
    if (eligibleBranches && eligibleBranches.length > 0) {
      params.push(eligibleBranches);
      conditions.push(`branch = ANY($${params.length})`);
    }
    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
    const users = await pool.query(
      `SELECT user_id FROM users WHERE cgpa >= $1 AND is_blocked = false ${whereClause}`,
      params
    );
    for (const user of users.rows) {
      await createNotification(user.user_id, 'placement',
        `🏢 New Drive: ${companyName}`,
        `${companyName} is hiring for ${role}. Check if you're eligible and apply!`,
        '/placement-drives'
      );
    }
    console.log(`Notified ${users.rows.length} students about ${companyName} drive`);
  } catch (e) {
    console.error('Failed to send placement notifications:', e.message);
  }
}

// Called when a new VTU resource is added
async function notifyNewResource(title, department) {
  try {
    const users = await pool.query(
      'SELECT user_id FROM users WHERE branch=$1 AND is_blocked=false LIMIT 500',
      [department]
    );
    for (const user of users.rows) {
      await createNotification(user.user_id, 'resource',
        `📚 New Resource: ${title}`,
        `A new study material was added for ${department}. Download it now!`,
        '/vtu-resources'
      );
    }
  } catch (e) {
    console.error('Failed to send resource notifications:', e.message);
  }
}

module.exports = { createNotification, notifyMarksUploaded, notifyNewPlacementDrive, notifyNewResource };
