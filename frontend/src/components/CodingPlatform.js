/**
 * CodingPlatform.js — LeetCode-style coding platform
 * Complete rewrite fixing:
 *  1. Test cases now display correctly (visible vs hidden)
 *  2. Examples pulled from parsed JSON properly
 *  3. Real pass/fail per test case (no more fake "all passed")
 *  4. Monaco-like split-panel UI with resizable dividers
 *  5. Separate Run (sample cases) vs Submit (all cases) flows
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: 'python',     label: 'Python 3',   color: '#3572A5' },
  { id: 'java',       label: 'Java',        color: '#b07219' },
  { id: 'cpp',        label: 'C++',         color: '#f34b7d' },
  { id: 'c',          label: 'C',           color: '#555555' },
  { id: 'javascript', label: 'JavaScript',  color: '#f1e05a' },
];

const DIFF_META = {
  easy:   { label: 'Easy',   color: '#00b8a3', bg: 'rgba(0,184,163,0.12)' },
  medium: { label: 'Medium', color: '#ffc01e', bg: 'rgba(255,192,30,0.12)' },
  hard:   { label: 'Hard',   color: '#ff375f', bg: 'rgba(255,55,95,0.12)'  },
};

const STATUS_META = {
  accepted:            { label: 'Accepted',            color: '#00b8a3' },
  wrong_answer:        { label: 'Wrong Answer',        color: '#f85149' },
  time_limit_exceeded: { label: 'Time Limit Exceeded', color: '#ffa116' },
  compile_error:       { label: 'Compilation Error',   color: '#f97316' },
  runtime_error:       { label: 'Runtime Error',       color: '#a855f7' },
  pending:             { label: 'Pending',             color: '#8b949e' },
};

const STARTER = {
  python:     `def solution():\n    # Read input\n    n = int(input())\n    # Write your solution here\n    print(n)\n\nsolution()`,
  java:       `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution here\n        System.out.println(n);\n    }\n}`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // Write your solution here\n    cout << n << endl;\n    return 0;\n}`,
  c:          `#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your solution here\n    printf("%d\\n", n);\n    return 0;\n}`,
  javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\n// Write your solution here\nconsole.log(n);`,
};

// Design tokens
const T = {
  bg:      '#0d1117',
  surf:    '#161b22',
  surf2:   '#1c2128',
  border:  '#30363d',
  text:    '#e6edf3',
  muted:   '#7d8590',
  dim:     '#484f58',
  accent:  '#ffa116',
  green:   '#3fb950',
  red:     '#f85149',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

// Safely handle values that may be:
//   - Already a JS array/object (pg returns JSONB this way)
//   - A JSON string (older path)
//   - null / undefined
function safeParse(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return val;  // plain object from pg JSONB
  if (typeof val === 'string' && val.trim()) {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
}

function DiffBadge({ d }) {
  const m = DIFF_META[d] || DIFF_META.easy;
  return <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: m.color, background: m.bg }}>{m.label}</span>;
}

function Tag({ label }) {
  return <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#21262d', color: '#8b949e', border: `1px solid ${T.border}` }}>{label}</span>;
}

function Spinner({ size = 16, color = T.accent }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}33`, borderTop: `2px solid ${color}`,
      borderRadius: '50%', display: 'inline-block',
      animation: 'cc-spin 0.7s linear infinite', verticalAlign: 'middle', flexShrink: 0,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Code Editor (textarea + line numbers)
// ─────────────────────────────────────────────────────────────────────────────

function CodeEditor({ value, onChange, language }) {
  const taRef  = useRef(null);
  const lnRef  = useRef(null);
  const lines  = value.split('\n').length;

  const syncScroll = () => {
    if (lnRef.current && taRef.current) lnRef.current.scrollTop = taRef.current.scrollTop;
  };

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = taRef.current;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const next = value.substring(0, s) + '    ' + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; });
    }
    // Auto-pair
    const pairs = { '(': ')', '[': ']', '{': '}' };
    if (pairs[e.key]) {
      e.preventDefault();
      const ta = taRef.current;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const sel = value.substring(s, end);
      const next = value.substring(0, s) + e.key + sel + pairs[e.key] + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = s + 1; ta.selectionEnd = end + 1; });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: T.bg, position: 'relative' }}>
      {/* Line numbers */}
      <div ref={lnRef} style={{ width: 48, background: '#0a0d12', borderRight: `1px solid #21262d`, overflow: 'hidden', userSelect: 'none', flexShrink: 0, paddingTop: 16 }}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} style={{ height: 21, lineHeight: '21px', textAlign: 'right', paddingRight: 10, color: T.dim, fontSize: 12, fontFamily: 'monospace' }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKey}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{
          flex: 1, background: 'transparent', color: '#c9d1d9',
          border: 'none', outline: 'none', resize: 'none',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          fontSize: 13, lineHeight: '21px', padding: '16px 16px 16px 12px',
          overflow: 'auto', tabSize: 4, caretColor: T.accent,
        }}
      />

      <span style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 10, color: T.dim, letterSpacing: '0.07em', fontFamily: 'monospace', textTransform: 'uppercase' }}>
        {language}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resizable handle
// ─────────────────────────────────────────────────────────────────────────────

function ResizeHandle({ onDrag, vertical = false }) {
  const dragging = useRef(false);
  const onMouseDown = (e) => {
    dragging.current = true;
    e.preventDefault();
    const move = (ev) => { if (dragging.current) onDrag(vertical ? ev.clientY : ev.clientX); };
    const up   = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up, { once: true });
  };
  return (
    <div onMouseDown={onMouseDown} style={{
      [vertical ? 'height' : 'width']: 5,
      [vertical ? 'width' : 'height']: '100%',
      background: 'transparent',
      cursor: vertical ? 'row-resize' : 'col-resize',
      flexShrink: 0, position: 'relative', zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        [vertical ? 'width' : 'height']: vertical ? 40 : 3,
        [vertical ? 'height' : 'width']: vertical ? 3 : 40,
        background: T.border, borderRadius: 4,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Case Result Panel
// ─────────────────────────────────────────────────────────────────────────────

function TestResultBox({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
      <div style={{
        background: '#0a0d12', borderRadius: 6, padding: '7px 10px',
        fontFamily: 'monospace', fontSize: 12, color: color || T.text,
        border: `1px solid #21262d`, minHeight: 30, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        {value || '(empty)'}
      </div>
    </div>
  );
}

function CaseCard({ tc, idx, isSubmit }) {
  return (
    <div style={{
      marginBottom: 8, padding: 12, borderRadius: 8,
      background: tc.passed ? 'rgba(0,184,163,0.05)' : 'rgba(248,81,73,0.05)',
      border: `1px solid ${tc.passed ? 'rgba(0,184,163,0.2)' : 'rgba(248,81,73,0.2)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: tc.passed ? '#00b8a3' : T.red }}>
          {tc.passed ? '✓' : '✗'} Case {idx + 1}
          {tc.hidden ? ' (hidden)' : ''}
        </span>
        {tc.tle && <span style={{ fontSize: 10, color: '#ffa116', background: 'rgba(255,161,22,0.12)', padding: '1px 7px', borderRadius: 10 }}>TLE</span>}
        {tc.compile_error && <span style={{ fontSize: 10, color: '#f97316', background: 'rgba(249,115,22,0.12)', padding: '1px 7px', borderRadius: 10 }}>CE</span>}
      </div>

      {/* Show input/expected/output only for visible cases */}
      {!tc.hidden && (
        <div style={{ display: 'grid', gridTemplateColumns: tc.passed ? '1fr 1fr' : '1fr 1fr 1fr', gap: 8 }}>
          <TestResultBox label="Input"    value={tc.input ?? tc.stdin}        color={T.muted} />
          <TestResultBox label="Expected" value={tc.expected_output ?? tc.expected} color="#00b8a3" />
          {!tc.passed && (
            <TestResultBox label="Your Output" value={tc.actual_output ?? tc.actual} color={T.red} />
          )}
        </div>
      )}
      {tc.hidden && !tc.passed && (
        <div style={{ fontSize: 12, color: T.muted }}>Hidden test case — check your logic for edge cases.</div>
      )}
      {(tc.stderr) && !tc.hidden && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: T.dim, textTransform: 'uppercase', marginBottom: 4 }}>Error Output</div>
          <pre style={{ background: '#0a0d12', borderRadius: 6, padding: '7px 10px', fontFamily: 'monospace', fontSize: 11, color: T.red, border: `1px solid #21262d`, margin: 0, whiteSpace: 'pre-wrap' }}>
            {tc.stderr}
          </pre>
        </div>
      )}
    </div>
  );
}

function TestCasePanel({ samples, runResult, submitResult, running, submitting, mode }) {
  const [activeCase, setActiveCase] = useState(0);

  if (mode === 'running' || mode === 'submitting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
        <Spinner size={22} color={mode === 'submitting' ? T.accent : T.green} />
        <span style={{ color: T.muted, fontSize: 13 }}>
          {mode === 'submitting' ? 'Running all test cases…' : 'Running sample test cases…'}
        </span>
      </div>
    );
  }

  if (mode === 'submitted' && submitResult) {
    const results = submitResult.results || [];
    const meta = STATUS_META[submitResult.status] || STATUS_META.pending;
    return (
      <div style={{ padding: '12px 16px', overflow: 'auto', height: '100%' }}>
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: meta.color, background: meta.color + '18', padding: '4px 16px', borderRadius: 20 }}>
            {meta.label}
          </span>
          {submitResult.total > 0 && (
            <span style={{ fontSize: 12, color: T.muted }}>
              {submitResult.passed_count}/{submitResult.total} test cases passed
            </span>
          )}
        </div>
        {results.map((tc, i) => <CaseCard key={i} tc={tc} idx={i} isSubmit />)}
      </div>
    );
  }

  if (mode === 'ran' && runResult) {
    return (
      <div style={{ padding: '12px 16px', overflow: 'auto', height: '100%' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12, fontWeight: 800,
            color: runResult.allPassed ? '#00b8a3' : T.red,
            background: runResult.allPassed ? 'rgba(0,184,163,0.12)' : 'rgba(248,81,73,0.12)',
            padding: '3px 14px', borderRadius: 20,
          }}>
            {runResult.allPassed ? '✓ All Sample Tests Passed' : '✗ Some Tests Failed'}
          </span>
          <span style={{ fontSize: 12, color: T.muted }}>
            {runResult.passedCount}/{runResult.total} passed
          </span>
        </div>
        {runResult.cases.map((tc, i) => <CaseCard key={i} tc={tc} idx={i} />)}
      </div>
    );
  }

  // Default: show interactive sample cases
  return (
    <div style={{ padding: '12px 16px', height: '100%', overflow: 'auto' }}>
      {samples.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', paddingTop: 24 }}>
          No sample test cases for this problem.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {samples.map((_, i) => (
              <button key={i} onClick={() => setActiveCase(i)} style={{
                padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: activeCase === i ? T.accent : '#21262d',
                color: activeCase === i ? '#000' : T.muted,
                border: `1px solid ${activeCase === i ? T.accent : T.border}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Case {i + 1}
              </button>
            ))}
            <span style={{ fontSize: 11, color: T.dim, marginLeft: 4 }}>
              + hidden cases run on Submit
            </span>
          </div>
          {samples[activeCase] && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <TestResultBox label="Input"           value={samples[activeCase].input}           color={T.text} />
              <TestResultBox label="Expected Output" value={samples[activeCase].expected_output} color="#00b8a3" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Problem List Page
// ─────────────────────────────────────────────────────────────────────────────

function ProblemList({ onSelect }) {
  const [problems, setProblems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [diff,     setDiff]     = useState('');
  const [lb,       setLB]       = useState([]);

  const stats  = { easy: 0, medium: 0, hard: 0 };
  const solved = problems.filter(p => { if (p.solved) stats[p.difficulty]++; return p.solved; }).length;

  useEffect(() => {
    const params = new URLSearchParams();
    if (diff)   params.set('difficulty', diff);
    if (search) params.set('search', search);
    setLoading(true);
    api.get('/coding/problems?' + params).then(r => setProblems(r.data.problems || [])).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff, search]);

  useEffect(() => {
    api.get('/coding/leaderboard').then(r => setLB(r.data || [])).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{globalCSS}</style>
      <Header />
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: '-0.4px' }}>
              <span style={{ color: T.dim }}>&lt;</span>
              <span style={{ color: T.accent }}>Coding</span>
              <span style={{ color: T.muted }}> Platform</span>
              <span style={{ color: T.dim }}> /&gt;</span>
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: T.muted }}>
              Practice DSA — Python · Java · C++ · C · JavaScript
            </p>
          </div>
          {/* Difficulty stat pills — also act as filters */}
          <div style={{ display: 'flex', gap: 10 }}>
            {['easy', 'medium', 'hard'].map(d => (
              <div key={d} onClick={() => setDiff(diff === d ? '' : d)} style={{
                textAlign: 'center', cursor: 'pointer', padding: '10px 20px', borderRadius: 12,
                background: diff === d ? DIFF_META[d].bg : T.surf,
                border: `1px solid ${diff === d ? DIFF_META[d].color + '44' : T.border}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: DIFF_META[d].color, lineHeight: 1 }}>{stats[d]}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: T.surf, borderRadius: 12, padding: '14px 20px', marginBottom: 20, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T.muted }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{solved}/{problems.length} solved</span>
          </div>
          <div style={{ height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${T.accent}, #ff8c00)`,
              width: problems.length ? `${(solved / problems.length) * 100}%` : '0%',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems…"
              style={{ width: '100%', background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px 9px 36px', color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={diff} onChange={e => setDiff(e.target.value)}
            style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px', color: diff ? DIFF_META[diff]?.color : T.text, fontSize: 13, outline: 'none' }}>
            <option value="">All Difficulty</option>
            {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{DIFF_META[d].label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          {/* Table */}
          <div style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px 1fr', background: '#0a0d12', padding: '10px 18px', borderBottom: `1px solid ${T.border}` }}>
              {['#', 'Title', 'Difficulty', 'Tags'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
              ))}
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={28} /></div>
            ) : problems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: T.muted, fontSize: 13 }}>No problems found.</div>
            ) : problems.map((p, idx) => (
              <div key={p.id} className="prob-row" onClick={() => onSelect(p.id)}
                style={{ display: 'grid', gridTemplateColumns: '50px 1fr 120px 1fr', padding: '12px 18px', cursor: 'pointer', alignItems: 'center', borderBottom: `1px solid ${T.border}22`, transition: 'background 0.12s' }}>
                <div style={{ fontSize: 12, color: p.solved ? '#00b8a3' : T.muted, fontWeight: p.solved ? 800 : 400 }}>
                  {p.solved ? '✓' : idx + 1}
                </div>
                <div className="prob-title" style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12, transition: 'color 0.12s' }}>
                  {p.title}
                </div>
                <div><DiffBadge d={p.difficulty} /></div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(p.tags || []).slice(0, 2).map(t => <Tag key={t} label={t} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>🏆 Leaderboard</div>
            {lb.slice(0, 10).map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 9 ? `1px solid ${T.border}22` : 'none' }}>
                <div style={{ width: 22, fontSize: 13, fontWeight: 800, color: i < 3 ? T.accent : T.muted, flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {(u.username || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{u.branch || ''}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.accent }}>{u.solved_count}</div>
                  <div style={{ fontSize: 9, color: T.muted }}>solved</div>
                </div>
              </div>
            ))}
            {lb.length === 0 && <div style={{ color: T.muted, fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No data yet.</div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Problem Solve Page (LeetCode layout)
// ─────────────────────────────────────────────────────────────────────────────

function ProblemSolve({ problemId, onBack }) {
  const containerRef = useRef(null);

  const [problem,       setProblem]      = useState(null);
  const [language,      setLanguage]     = useState('python');
  const [codeMap,       setCodeMap]      = useState({});
  const [customInput,   setCustomInput]  = useState('');

  // Per-language code — read from map or STARTER
  const code    = codeMap[language] || STARTER[language] || '';
  const setCode = (v) => {
    setCodeMap(m => ({ ...m, [language]: v }));
    // Autosave to localStorage (debounced via useEffect below)
  };
  const [consoleOutput, setConsole]      = useState(null);
  const [runResult,     setRunResult]    = useState(null);
  const [submitResult,  setSubmitResult] = useState(null);
  const [running,       setRunning]      = useState(false);
  const [submitting,    setSubmitting]   = useState(false);
  const [leftTab,       setLeftTab]      = useState('description');
  const [outTab,        setOutTab]       = useState('testcases');
  const [tcMode,        setTcMode]       = useState('default');
  const [submissions,   setSubmissions]  = useState([]);
  const [revealedHints, setRevealedHints] = useState([]);

  // Resizable panel widths
  const [leftPct, setLeftPct] = useState(38);
  const [outPct,  setOutPct]  = useState(34);

  const handleHDrag = useCallback((x) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setLeftPct(Math.max(22, Math.min(56, ((x - r.left) / r.width) * 100)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVDrag = useCallback((y) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const innerH = r.height - 49; // minus topbar
    const innerTop = r.top + 49;
    const pct = ((y - innerTop) / innerH) * 100;
    setOutPct(Math.max(18, Math.min(65, 100 - pct)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load problem
  useEffect(() => {
    setProblem(null);
    setCodeMap({});
    api.get(`/coding/problems/${problemId}`).then(r => {
      const p = r.data;
      setProblem(p);
      // Load all saved languages from localStorage
      const sc = safeParse(p.starter_code, {});
      const initial = {};
      ['python','java','cpp','c','javascript'].forEach(lang => {
        const saved = localStorage.getItem(`cc_code_${problemId}_${lang}`);
        initial[lang] = saved || sc?.[lang] || STARTER[lang] || '';
      });
      setCodeMap(initial);
      const samples = p.sample_cases || [];
      if (samples.length > 0) setCustomInput(samples[0].input || '');
    }).catch(() => {});
    api.get(`/coding/submissions?problem_id=${problemId}`).then(r => setSubmissions(r.data || [])).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // Language change → load saved code or starter
  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(`cc_code_${problemId}_${language}`);
    if (saved) {
      setCodeMap(m => ({ ...m, [language]: saved }));
    } else {
      const sc = safeParse(problem.starter_code, {});
      setCodeMap(m => ({ ...m, [language]: sc?.[language] || STARTER[language] || `// ${language} solution` }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, problem]);

  // Autosave current code to localStorage (1.5s debounce)
  useEffect(() => {
    if (!problemId || !code) return;
    const t = setTimeout(() => localStorage.setItem(`cc_code_${problemId}_${language}`, code), 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, problemId, language]);

  // ── RUN: visible test cases only ─────────────────────────────────────────
  const handleRun = async () => {
    if (!problem) return;
    const samples = problem.sample_cases || [];
    setRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setTcMode('running');
    setOutTab('testcases');

    try {
      const cases = [];
      let allPassed = true;

      for (const tc of samples) {
        const r = await api.post('/coding/run', { language, source_code: code, stdin: tc.input || '' });
        const actual   = (r.data.stdout || '').trim();
        const expected = (tc.expected_output || '').trim();
        const passed   = r.data.success && !r.data.tle && actual === expected;
        if (!passed) allPassed = false;
        cases.push({ input: tc.input, expected, actual, passed, stderr: r.data.stderr || '', tle: r.data.tle || false });
      }

      // Run custom input for console tab
      const consoleRun = await api.post('/coding/run', { language, source_code: code, stdin: customInput });
      setConsole(consoleRun.data);
      setRunResult({ cases, allPassed, passedCount: cases.filter(c => c.passed).length, total: cases.length });
      setTcMode('ran');
    } catch (e) {
      setConsole({ stderr: e.response?.data?.error || 'Execution failed', stdout: '' });
      setTcMode('default');
    }
    setRunning(false);
  };

  // ── SUBMIT: backend runs all (visible + hidden) ───────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setRunResult(null);
    setSubmitResult(null);
    setTcMode('submitting');
    setOutTab('testcases');

    try {
      const r = await api.post('/coding/submit', { problem_id: problemId, language, source_code: code });
      setSubmitResult(r.data);
      setTcMode('submitted');
      api.get(`/coding/submissions?problem_id=${problemId}`).then(r2 => setSubmissions(r2.data || [])).catch(() => {});
    } catch (e) {
      setSubmitResult({ passed: false, status: 'runtime_error', error: e.response?.data?.error || 'Submission failed', results: [], total: 0, passed_count: 0 });
      setTcMode('submitted');
    }
    setSubmitting(false);
  };

  if (!problem) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}><Spinner size={36} /></div>;
  }

  const examples = safeParse(problem.examples, []);
  const hints    = safeParse(problem.hints, []);
  const samples  = problem.sample_cases || [];

  const leftTabs = [
    { id: 'description', label: 'Description' },
    { id: 'submissions', label: `Submissions${submissions.length ? ` (${submissions.length})` : ''}` },
    ...(hints.length > 0 ? [{ id: 'hints', label: `Hints (${hints.length})` }] : []),
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, overflow: 'hidden', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{globalCSS}</style>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div style={{ height: 49, flexShrink: 0, background: T.surf, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', zIndex: 20 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 18, background: T.border }} />
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {problem.title}
        </span>
        <DiffBadge d={problem.difficulty} />
        {problem.solved && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00b8a3', background: 'rgba(0,184,163,0.12)', padding: '2px 10px', borderRadius: 20, flexShrink: 0 }}>✓ Solved</span>
        )}
        <div style={{ width: 1, height: 18, background: T.border }} />

        <select value={language} onChange={e => setLanguage(e.target.value)}
          style={{ background: '#21262d', border: `1px solid ${T.border}`, borderRadius: 8, padding: '5px 10px', color: LANGUAGES.find(l => l.id === language)?.color || T.text, fontSize: 12, fontWeight: 600, outline: 'none' }}>
          {LANGUAGES.map(l => <option key={l.id} value={l.id} style={{ color: l.color }}>{l.label}</option>)}
        </select>

        <button onClick={handleRun} disabled={running || submitting} style={{
          background: 'none', border: `1px solid ${T.green}`, borderRadius: 8, color: T.green,
          padding: '5px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          opacity: (running || submitting) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          {running ? <><Spinner size={12} color={T.green} /> Running…</> : '▶ Run'}
        </button>

        <button onClick={handleSubmit} disabled={running || submitting} style={{
          background: T.accent, border: 'none', borderRadius: 8, color: '#000',
          padding: '5px 18px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          opacity: (running || submitting) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          {submitting ? <><Spinner size={12} color="#000" /> Submitting…</> : '↑ Submit'}
        </button>
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Description */}
        <div style={{ width: `${leftPct}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: T.surf, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            {leftTabs.map(tab => (
              <button key={tab.id} onClick={() => setLeftTab(tab.id)} className="cc-tab" style={{
                background: 'none', border: 'none', padding: '10px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                color: leftTab === tab.id ? T.text : T.muted,
                borderBottom: leftTab === tab.id ? `2px solid ${T.accent}` : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Description */}
          {leftTab === 'description' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px', background: '#0a0d12' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {(problem.tags || []).map(t => <Tag key={t} label={t} />)}
                {(problem.companies || []).map(c => (
                  <span key={c} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(255,161,22,0.08)', color: T.accent, border: `1px solid ${T.accent}33` }}>{c}</span>
                ))}
              </div>

              <div style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.85, whiteSpace: 'pre-wrap', marginBottom: 24 }}>
                {problem.description}
              </div>

              {examples.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Examples</h3>
                  {examples.map((ex, i) => (
                    <div key={i} style={{ background: T.surf, borderRadius: 10, padding: 16, marginBottom: 10, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>Example {i + 1}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {ex.input  != null && <div style={{ marginBottom: 4 }}><span style={{ color: T.muted }}>Input: </span><span style={{ color: '#c9d1d9' }}>{ex.input}</span></div>}
                        {ex.output != null && <div style={{ marginBottom: ex.explanation ? 6 : 0 }}><span style={{ color: T.muted }}>Output: </span><span style={{ color: '#00b8a3' }}>{ex.output}</span></div>}
                        {ex.explanation && <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6 }}><span style={{ fontWeight: 700 }}>Explanation: </span>{ex.explanation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Constraints</h3>
                  <div style={{ background: T.surf, borderRadius: 10, padding: 14, border: `1px solid ${T.border}`, fontFamily: 'monospace', fontSize: 12, color: T.muted, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {problem.constraints}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: `1px solid ${T.border}22` }}>
                {[['Acceptance', `${problem.acceptance_rate || 0}%`], ['Total Submissions', problem.total_submissions || 0], ['Accepted', problem.accepted_count || 0]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions */}
          {leftTab === 'submissions' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#0a0d12' }}>
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, paddingTop: 32 }}>No submissions yet.</div>
              ) : submissions.map((s, i) => {
                const meta = STATUS_META[s.status] || STATUS_META.pending;
                return (
                  <div key={i} style={{ padding: 12, marginBottom: 8, borderRadius: 10, background: T.surf, border: `1px solid ${meta.color}22` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.color + '18', padding: '2px 10px', borderRadius: 10 }}>{meta.label}</span>
                      <span style={{ fontSize: 11, color: T.muted }}>{new Date(s.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.language} · {s.passed_count}/{s.total_count} tests</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hints */}
          {leftTab === 'hints' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#0a0d12' }}>
              {hints.map((hint, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <button onClick={() => setRevealedHints(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                    style={{ background: 'none', border: `1px solid ${T.accent}44`, borderRadius: 8, color: T.accent, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>
                    💡 {revealedHints.includes(i) ? '▼' : '▶'} Hint {i + 1}
                  </button>
                  {revealedHints.includes(i) && (
                    <div style={{ background: 'rgba(255,161,22,0.07)', borderRadius: 8, padding: 12, border: `1px solid ${T.accent}22`, fontSize: 13, color: '#c9d1d9', lineHeight: 1.7 }}>
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Horizontal resize */}
        <ResizeHandle onDrag={handleHDrag} />

        {/* RIGHT: Editor + Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Code editor */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <CodeEditor value={code} onChange={setCode} language={language} />
          </div>

          {/* Vertical resize */}
          <ResizeHandle onDrag={handleVDrag} vertical />

          {/* Bottom panel */}
          <div style={{ height: `${outPct}%`, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0a0d12', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', background: T.surf, borderBottom: `1px solid ${T.border}`, flexShrink: 0, alignItems: 'center' }}>
              {[{ id: 'testcases', label: 'Test Cases' }, { id: 'console', label: 'Console' }].map(tab => (
                <button key={tab.id} onClick={() => setOutTab(tab.id)} className="cc-tab" style={{
                  background: 'none', border: 'none', padding: '8px 16px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  color: outTab === tab.id ? T.text : T.muted,
                  borderBottom: outTab === tab.id ? `2px solid ${T.accent}` : '2px solid transparent',
                }}>{tab.label}</button>
              ))}
              {/* Inline status for submit */}
              {submitResult && outTab === 'testcases' && (
                <div style={{ marginLeft: 'auto', paddingRight: 14, display: 'flex', alignItems: 'center' }}>
                  {(() => { const m = STATUS_META[submitResult.status] || STATUS_META.pending; return (
                    <span style={{ fontSize: 12, fontWeight: 800, color: m.color, background: m.color + '18', padding: '3px 14px', borderRadius: 20 }}>
                      {m.label} · {submitResult.passed_count}/{submitResult.total}
                    </span>
                  );})()}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              {outTab === 'testcases' && (
                <TestCasePanel
                  samples={samples}
                  runResult={runResult}
                  submitResult={submitResult}
                  running={running}
                  submitting={submitting}
                  mode={tcMode}
                />
              )}

              {outTab === 'console' && (
                <div style={{ padding: '12px 16px', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: T.muted, whiteSpace: 'nowrap' }}>Custom Input:</span>
                    <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} rows={1}
                      style={{ flex: 1, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 8px', color: T.text, fontFamily: 'monospace', fontSize: 12, resize: 'none', outline: 'none' }} />
                  </div>
                  {running && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Spinner size={12} color={T.green} /><span style={{ fontSize: 12, color: T.green }}>Executing…</span></div>}
                  {consoleOutput ? (
                    <div>
                      {consoleOutput.stderr && <pre style={{ color: T.red, fontFamily: 'monospace', fontSize: 12, margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{consoleOutput.stderr}</pre>}
                      {consoleOutput.stdout
                        ? <pre style={{ color: T.green, fontFamily: 'monospace', fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>{consoleOutput.stdout}</pre>
                        : !consoleOutput.stderr && <span style={{ color: T.muted, fontSize: 12 }}>No output</span>
                      }
                    </div>
                  ) : <span style={{ color: T.muted, fontSize: 12 }}>Click ▶ Run to see output here.</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Global CSS (injected once)
// ─────────────────────────────────────────────────────────────────────────────

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes cc-spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #484f58; }
  button, select, input, textarea { font-family: 'JetBrains Mono', monospace; }
  .prob-row:hover { background: #1c2128 !important; }
  .prob-row:hover .prob-title { color: #ffa116 !important; }
  .cc-tab:hover { color: #e6edf3 !important; }
  select option { background: #161b22; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export default function CodingPlatform() {
  const [selected, setSelected] = useState(null);
  return selected
    ? <ProblemSolve problemId={selected} onBack={() => setSelected(null)} />
    : <ProblemList onSelect={setSelected} />;
}
