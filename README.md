# Campus Connect v9 — VTU Student Platform

> Complete VTU academic hub with Internship Programs, Final Year Projects marketplace, full mobile responsiveness, and Razorpay payment integration.

---

## What's New in v9

### Full Responsive Design
- Mobile (320px+), Tablet (600px+), Laptop (1024px+) — all fully supported
- Login/Register: Left panel hides on mobile, forms stack cleanly
- Header drawer: Scrollable, 85vw on phones, proper touch targets
- Homepage: Hero stats 2-col on mobile, feature cards responsive grid
- All tables: Horizontal scroll on small screens
- CSS: clamp() for fluid type/spacing, safe-area insets for notched phones, iOS input-zoom prevention

### Internship Programs Module
Students: Browse curated internship programs, apply with a message, track application status, download certificates on completion
Admin: Create/edit/delete programs, view all applicants, update status (pending/approved/rejected/completed), issue certificates

### Final Year Projects Module
Students: Browse ready-made projects (free or paid), buy with Razorpay, download source code, submit custom project requests, track status
Admin: Create/edit/delete project listings, review custom requests, set price, update delivery URL

### Razorpay Payments
- Premium subscription (existing)
- NEW: Project purchases (one-time payment per project)
- NEW: Custom project payment (after admin quotes price)
- Free projects bypass payment entirely
- Signature verification on backend for all payments

### Admin Panel Updates
- New sidebar items: Internships, Projects
- AdminDashboard shows internship program count and project listing count
- Full CRUD and applicant management for internships
- Full CRUD and custom request review for projects

---

## Database Migration

Run migration_v3.sql after deploying:

```bash
# Local
psql -d CampusConnect -f backend/database/migration_v3.sql

# On Render (via psql connection string from dashboard)
psql "postgres://user:pass@host/dbname" -f backend/database/migration_v3.sql
```

This creates 5 new tables: internship_programs, internship_applications, project_listings, project_purchases, custom_project_requests.
Includes seed data: 3 sample internships + 5 sample projects so you can test immediately.

---

## Quick Deploy to Render

1. Push this repo to GitHub
2. Go to render.com -> New -> Blueprint
3. Connect your GitHub repo (Render reads render.yaml automatically)
4. Add env vars in Render dashboard
5. Deploy (~5 minutes)
6. After first deploy: Run migration_v3.sql against your Render PostgreSQL

---

## Environment Variables

Backend (backend/.env):
- DATABASE_URL — Render PostgreSQL connection
- JWT_SECRET — Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
- EMAIL_USER / EMAIL_PASS — Gmail App Password (OTP, password reset)
- RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — razorpay.com (all payments)
- CLOUDINARY_URL etc. — cloudinary.com (profile photos)
- ANTHROPIC_API_KEY — console.anthropic.com (AI Study Tutor)

Frontend (frontend/.env) — NEW in v9:
- REACT_APP_RAZORPAY_KEY_ID — Your Razorpay KEY_ID (public key only, never the secret)

See backend/.env.example and frontend/.env.example for templates.

---

## Local Development

```bash
# 1. Setup PostgreSQL
createdb CampusConnect
psql -d CampusConnect -f backend/database/init.sql
psql -d CampusConnect -f backend/database/migration_v2.sql
psql -d CampusConnect -f backend/database/migration_v3.sql

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run dev    # runs on :5000

# 3. Frontend
cd frontend
cp .env.example .env    # add REACT_APP_RAZORPAY_KEY_ID
npm install
npm start      # runs on :3000, proxies /api to :5000
```

---

## New Routes

/internship-programs — Browse & apply for internships (student, auth required)
/projects — Browse, buy, request custom projects (student, auth required)
/admin-portal-9823/internships — Manage programs (admin)
/admin-portal-9823/projects — Manage listings & custom requests (admin)

## New API Endpoints

GET  /api/internship-programs              — List active programs
POST /api/internship-programs/:id/apply    — Apply for a program
GET  /api/internship-programs/my/applications — My applications
GET  /api/projects                         — List active projects
POST /api/projects/:id/create-order        — Buy project (Razorpay order)
POST /api/projects/verify-payment          — Verify project payment
GET  /api/projects/my-purchases            — My purchased projects
POST /api/projects/custom                  — Submit custom project request
GET  /api/projects/custom                  — My custom requests
GET  /api/admin/internships                — Admin: list programs
POST /api/admin/internships                — Admin: create program
PUT  /api/admin/internships/:id            — Admin: update program
DELETE /api/admin/internships/:id          — Admin: delete program
GET  /api/admin/internships/:id/applicants — Admin: view applicants
PATCH /api/admin/internships/applications/:id — Admin: update applicant status/cert
GET  /api/admin/projects                   — Admin: list all projects
POST /api/admin/projects                   — Admin: create project
PUT  /api/admin/projects/:id               — Admin: update project
DELETE /api/admin/projects/:id             — Admin: delete project
GET  /api/admin/custom-projects            — Admin: list custom requests
PATCH /api/admin/custom-projects/:id       — Admin: update custom request (price/status/delivery)
