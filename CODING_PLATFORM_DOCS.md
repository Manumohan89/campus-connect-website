# 🚀 CampusConnect Coding Platform — Complete Rebuild

## What Was Fixed (Root Cause Analysis)

### 1. ❌ Test cases not showing → ✅ Fixed
**Root cause**: The `GET /problems/:id` endpoint returned `examples` and `hints` as raw JSON strings (e.g., `"[{\"input\":...}]"`), but the frontend tried to use them directly as arrays without parsing.

**Fix**: `CodingPlatform.js` now uses `safeParse()` utility that handles both raw strings and already-parsed arrays.

```js
// Before (broken):
const examples = problem.examples;  // might be a string!

// After (fixed):
function safeParse(val, fallback = []) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}
const examples = safeParse(problem.examples, []);
```

### 2. ❌ Problems not saving from admin → ✅ Fixed
**Root cause**: `AdminCodingProblems.js` was sending `hints` as an array (which the DB stores as JSONB fine), but `examples` and `test_cases` were sent as partially-formed objects. The edit form also didn't reconstruct data from the saved problem.

**Fix**: `AdminCodingProblems.js` now:
- Sends clean, validated payload with proper types
- `handleOpenEdit()` calls `safeParse()` to reconstruct form from saved data
- Validates required fields before API call
- Converts `tags`, `companies`, `hints` properly (CSV string ↔ array)

### 3. ❌ Compiler always shows "all test cases passed" → ✅ Fixed
**Root cause**: The Run button was calling `/coding/run` with `stdin: customInput` but never actually comparing against expected test case outputs — it just showed the raw stdout.

**Fix**: `handleRun()` now:
1. Loops through each visible sample case
2. Calls `/coding/run` with that case's `input` as stdin
3. Compares `stdout.trim()` against `expected_output.trim()`
4. Shows per-case pass/fail results

### 4. ❌ No separation visible vs hidden → ✅ Fixed
- **Run** → Only executes `problem.sample_cases` (visible, `hidden: false`)
- **Submit** → Backend executes ALL test cases (visible + hidden)
- Hidden cases in submit results show `"(hidden)"` for input/expected

### 5. ❌ Poor UI/UX → ✅ Complete redesign
- Split-panel layout (38% description / 62% editor by default)
- Resizable panels via drag handles
- Monaco-like editor with line numbers, tab-to-indent, auto-pair brackets
- Clean dark theme with design token system
- Per-case test result cards with Input/Expected/Your Output

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌──────────────┐    ┌───────────────────────┐  │
│  │  ProblemList │    │    ProblemSolve        │  │
│  │  (table +    │    │  ┌────────┬─────────┐  │  │
│  │  leaderboard)│    │  │  Left  │  Right  │  │  │
│  └──────────────┘    │  │ Desc   │ Editor  │  │  │
│                       │  │ Exmpl  ├─────────│  │  │
│                       │  │ Constr │ Console │  │  │
│                       │  └────────┴─────────┘  │  │
│                       └───────────────────────┘  │
└────────────────────────┬────────────────────────┘
                         │ axios
                         │
┌────────────────────────▼────────────────────────┐
│              Node.js / Express Backend           │
│                                                  │
│  POST /api/coding/run     ← Run with custom stdin│
│  POST /api/coding/submit  ← All test cases       │
│  GET  /api/coding/problems                       │
│  GET  /api/coding/problems/:id                   │
│  POST /api/coding/admin/problems  (admin)        │
│  PUT  /api/coding/admin/problems/:id (admin)     │
└────────────────────────┬────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    ┌──────▼──────┐ ┌────▼────┐ ┌─────▼──────┐
    │  PostgreSQL  │ │ Python3 │ │  gcc/g++   │
    │  Database    │ │ Runtime │ │  Compiler  │
    └─────────────┘ └─────────┘ └────────────┘
```

---

## Database Schema

```sql
-- Problems table
CREATE TABLE coding_problems (
    id               SERIAL PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    difficulty       TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    difficulty_order INTEGER DEFAULT 2,
    tags             TEXT[] DEFAULT '{}',
    constraints      TEXT,
    hints            JSONB DEFAULT '[]',      -- string[]
    starter_code     JSONB DEFAULT '{}',      -- {python:'...', java:'...', cpp:'...', c:'...', javascript:'...'}
    test_cases       JSONB DEFAULT '[]',      -- {input, expected_output, hidden}[]
    examples         JSONB DEFAULT '[]',      -- {input, output, explanation}[]
    companies        TEXT[] DEFAULT '{}',
    acceptance_rate  REAL DEFAULT 0,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- Submissions table
CREATE TABLE coding_submissions (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(user_id),
    problem_id   INTEGER REFERENCES coding_problems(id),
    language     TEXT NOT NULL,
    source_code  TEXT NOT NULL,
    passed_count INTEGER DEFAULT 0,
    total_count  INTEGER DEFAULT 0,
    score        INTEGER DEFAULT 0,
    status       TEXT DEFAULT 'pending',  -- accepted | wrong_answer | compile_error | time_limit_exceeded | runtime_error
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- Solved tracker (for progress display)
CREATE TABLE user_solved_problems (
    user_id    INTEGER REFERENCES users(user_id),
    problem_id INTEGER REFERENCES coding_problems(id),
    solved_at  TIMESTAMP DEFAULT NOW(),
    language   TEXT,
    PRIMARY KEY (user_id, problem_id)
);
```

---

## API Reference

### Run Code (visible test cases / custom input)
```
POST /api/coding/run
Authorization: Bearer <token>

Body:
{
  "language": "python",          // python | java | cpp | c | javascript
  "source_code": "print(42)",
  "stdin": "42"                  // optional custom input
}

Response:
{
  "stdout": "42",
  "stderr": "",
  "success": true,
  "tle": false,
  "language": "python",
  "engine": "built-in"
}
```

### Submit (all test cases)
```
POST /api/coding/submit
Authorization: Bearer <token>

Body:
{
  "problem_id": 1,
  "language": "python",
  "source_code": "..."
}

Response:
{
  "passed": true,
  "status": "accepted",           // accepted | wrong_answer | compile_error | time_limit_exceeded
  "score": 100,
  "passed_count": 5,
  "total": 5,
  "results": [
    {
      "input": "2 7",
      "expected_output": "0 1",
      "actual_output": "0 1",
      "passed": true,
      "hidden": false,
      "tle": false,
      "compile_error": false,
      "stderr": ""
    },
    {
      "input": "(hidden)",          // hidden test cases show "(hidden)"
      "expected_output": "(hidden)",
      "actual_output": "(hidden)",
      "passed": true,
      "hidden": true
    }
  ]
}
```

### Create Problem (Admin)
```
POST /api/coding/admin/problems
Authorization: Bearer <admin-token>

Body:
{
  "title": "Two Sum",
  "description": "Given an array of integers nums...",
  "difficulty": "easy",
  "tags": ["Array", "Hash Map"],
  "constraints": "2 <= nums.length <= 10^4",
  "hints": ["Try using a hash map"],
  "companies": ["Google", "Amazon"],
  "examples": [
    { "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0]+nums[1]==9" }
  ],
  "test_cases": [
    { "input": "4\n2 7 11 15\n9", "expected_output": "0 1", "hidden": false },
    { "input": "3\n3 2 4\n6",     "expected_output": "1 2", "hidden": true  }
  ],
  "starter_code": {
    "python":     "def solution():\n    pass",
    "java":       "public class Solution { ... }",
    "cpp":        "#include<bits/stdc++.h>...",
    "c":          "#include<stdio.h>...",
    "javascript": "const lines = ..."
  }
}
```

---

## Frontend Component Structure

```
src/
├── components/
│   └── CodingPlatform.js       ← Main entry (exports default)
│       ├── ProblemList         ← Problem table + leaderboard
│       │   ├── DiffBadge
│       │   ├── Tag
│       │   └── Spinner
│       └── ProblemSolve        ← LeetCode-style split layout
│           ├── CodeEditor      ← textarea + line numbers + shortcuts
│           ├── ResizeHandle    ← Draggable panel divider
│           └── TestCasePanel   ← Shows run/submit results
│               └── CaseCard   ← Per-test-case pass/fail card
│
└── admin/
    └── AdminCodingProblems.js  ← Admin CRUD
        ├── ProblemForm         ← Multi-section create/edit dialog
        │   ├── ExampleEditor   ← Add/remove/edit examples
        │   ├── TestCaseEditor  ← Visible + Hidden groups
        │   └── StarterCodeEditor ← Per-language templates
        └── DeleteConfirm       ← Archive confirmation
```

---

## Setup Guide

### Prerequisites
```bash
# Node.js 18+
node --version  # v18.x or higher

# PostgreSQL 14+
psql --version

# Python 3 (for code execution)
python3 --version

# GCC / G++ (for C/C++)
gcc --version && g++ --version
```

### 1. Clone & Install
```bash
git clone <your-repo>
cd campus-connect-integrated

# Install root dependencies
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
cd backend
# Create database
createdb campus_connect

# Run migrations in order
psql -d campus_connect -f database/init.sql
psql -d campus_connect -f database/migration.sql
psql -d campus_connect -f database/migration_v2.sql
psql -d campus_connect -f database/migration_v3.sql

# Optional: seed sample problems
node database/seed_coding.js
```

### 3. Environment Variables
```bash
# backend/.env
DATABASE_URL=postgresql://localhost/campus_connect
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

### 4. Run Development
```bash
# From root
npm run dev

# Or separately:
cd backend  && npm run dev   # starts on :5000
cd frontend && npm start     # starts on :3000
```

### 5. Verify Execution Engine
```bash
# Test Python
python3 --version

# Test C++
g++ --version

# Test Java (optional, requires JDK)
java --version && javac --version
```

---

## Troubleshooting

### "Test cases not showing"
1. Check the problem has `examples` in the DB: `SELECT examples FROM coding_problems WHERE id=1;`
2. The value should be valid JSON, e.g., `[{"input":"2","output":"4"}]`
3. If it's `null` or `[]`, edit the problem in the admin panel and re-save

### "Compiler returns wrong results"
1. Check your test case `input` matches what the code reads from `stdin`
2. Comparison is exact (trimmed). Trailing newlines are stripped.
3. Test manually: `echo "5" | python3 solution.py`

### "Admin save fails"
1. Check browser console for the API error
2. Ensure at least one visible test case has both `input` and `expected_output`
3. Check backend logs: `cd backend && npm run dev`

### "Always shows Wrong Answer"
1. Make sure your expected output matches EXACTLY what your code prints
2. Common issue: extra space or missing newline in expected output
3. Test locally: copy the input → run code → compare output byte-for-byte

---

## Production Deployment (Render.com)

```yaml
# render.yaml (backend)
services:
  - type: web
    name: campus-connect-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node app.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: campus-connect-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true

databases:
  - name: campus-connect-db
    databaseName: campus_connect
    user: campusconnect
```

> **Note**: For Java execution on Render, add `apt-get install -y default-jdk` to your build command.

---

## Security Notes

The execution engine runs code in temp directories with:
- **10 second timeout** per execution
- **128MB memory limit** (Java JVM flag `-Xmx128m`)
- **50KB output limit** (prevents infinite print loops)
- **Temp file cleanup** after every run

For production with untrusted users, consider adding:
- Docker container sandbox (gVisor/seccomp)
- Network isolation (`--network none`)
- Read-only filesystem mounts
- CPU quota limiting
