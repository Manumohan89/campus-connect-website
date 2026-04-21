/**
 * AdminCodingProblems.js — Fixed admin panel for problem management
 *
 * Fixes:
 *  1. All fields now saved correctly (examples, test_cases, starter_code as proper JSON)
 *  2. Edit loads all existing data (including test cases + examples)
 *  3. Test cases clearly split into Visible vs Hidden
 *  4. Validation before submit
 *  5. Clean, readable UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens (matches CodingPlatform dark theme)
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:     '#0d1117',
  surf:   '#161b22',
  surf2:  '#1c2128',
  border: '#30363d',
  text:   '#e6edf3',
  muted:  '#7d8590',
  dim:    '#484f58',
  accent: '#ffa116',
  green:  '#3fb950',
  red:    '#f85149',
};

const DIFF_META = {
  easy:   { label: 'Easy',   color: '#00b8a3', bg: 'rgba(0,184,163,0.12)' },
  medium: { label: 'Medium', color: '#ffc01e', bg: 'rgba(255,192,30,0.12)' },
  hard:   { label: 'Hard',   color: '#ff375f', bg: 'rgba(255,55,95,0.12)'  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default starter code templates
// ─────────────────────────────────────────────────────────────────────────────
const STARTER_TEMPLATE = {
  python:     `def solution():\n    n = int(input())\n    print(n)\n\nsolution()`,
  java:       `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n);\n    }\n}`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    cout << n << endl;\n    return 0;\n}`,
  c:          `#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", n);\n    return 0;\n}`,
  javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nconsole.log(n);`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Default empty form
// ─────────────────────────────────────────────────────────────────────────────
function emptyForm() {
  return {
    title: '',
    description: '',
    difficulty: 'easy',
    tags: '',
    constraints: '',
    companies: '',
    hints: '',
    examples: [
      { input: '', output: '', explanation: '' },
    ],
    test_cases: [
      { input: '', expected_output: '', hidden: false },
      { input: '', expected_output: '', hidden: true  },
    ],
    starter_code: { ...STARTER_TEMPLATE },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function safeParse(val, fallback) {
  if (Array.isArray(val) || (val !== null && typeof val === 'object')) return val;
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function Badge({ label, color, bg }) {
  return <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg }}>{label}</span>;
}

function DiffBadge({ d }) {
  const m = DIFF_META[d] || DIFF_META.easy;
  return <Badge label={m.label} color={m.color} bg={m.bg} />;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: type === 'success' ? '#1a3a2a' : '#3a1a1a',
      border: `1px solid ${type === 'success' ? T.green : T.red}`,
      color: type === 'success' ? T.green : T.red,
      borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'inherit',
      animation: 'fadeIn 0.2s ease',
    }}>
      {type === 'success' ? '✓ ' : '✗ '}{msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-editors
// ─────────────────────────────────────────────────────────────────────────────

const fieldStyle = {
  width: '100%', background: T.surf2, border: `1px solid ${T.border}`,
  borderRadius: 8, padding: '9px 12px', color: T.text,
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', resize: 'vertical',
};
const monoStyle = { ...fieldStyle, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ExampleEditor({ examples, onChange }) {
  const add    = () => onChange([...examples, { input: '', output: '', explanation: '' }]);
  const remove = (i) => onChange(examples.filter((_, idx) => idx !== i));
  const set    = (i, k, v) => onChange(examples.map((e, idx) => idx === i ? { ...e, [k]: v } : e));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Examples (shown to students)</label>
        <button onClick={add} style={{ background: 'none', border: `1px solid ${T.green}`, color: T.green, borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Example
        </button>
      </div>
      {examples.map((ex, i) => (
        <div key={i} style={{ background: T.surf2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Example {i + 1}</span>
            {examples.length > 1 && (
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>Input</label>
              <textarea value={ex.input} onChange={e => set(i, 'input', e.target.value)} rows={2}
                placeholder="e.g. nums = [2,7,11,15], target = 9"
                style={monoStyle} />
            </div>
            <div>
              <label style={labelStyle}>Output</label>
              <textarea value={ex.output} onChange={e => set(i, 'output', e.target.value)} rows={2}
                placeholder="e.g. [0,1]"
                style={monoStyle} />
            </div>
          </div>
          <label style={labelStyle}>Explanation (optional)</label>
          <input value={ex.explanation} onChange={e => set(i, 'explanation', e.target.value)}
            placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
            style={fieldStyle} />
        </div>
      ))}
    </div>
  );
}

function TestCaseEditor({ testCases, onChange }) {
  const add    = (hidden) => onChange([...testCases, { input: '', expected_output: '', hidden }]);
  const remove = (i) => onChange(testCases.filter((_, idx) => idx !== i));
  const set    = (i, k, v) => onChange(testCases.map((tc, idx) => idx === i ? { ...tc, [k]: v } : tc));

  const visible = testCases.filter(tc => !tc.hidden);
  const hidden  = testCases.filter(tc => tc.hidden);

  const renderGroup = (list, isHidden) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isHidden ? 'rgba(249,115,22,0.12)' : 'rgba(63,185,80,0.12)',
            color: isHidden ? '#f97316' : T.green,
            border: `1px solid ${isHidden ? '#f9731633' : '#3fb95033'}`,
          }}>
            {isHidden ? '🔒 Hidden' : '👁 Visible'}
          </span>
          <span style={{ fontSize: 12, color: T.muted }}>
            {isHidden ? 'Used during Submit (not shown to student)' : 'Shown to student as sample cases'}
          </span>
        </div>
        <button onClick={() => add(isHidden)} style={{
          background: 'none', border: `1px solid ${isHidden ? '#f97316' : T.green}`,
          color: isHidden ? '#f97316' : T.green, borderRadius: 6,
          padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          + Add {isHidden ? 'Hidden' : 'Visible'}
        </button>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '12px 16px', background: T.surf2, borderRadius: 8, border: `1px solid ${T.border}`, color: T.dim, fontSize: 12, textAlign: 'center' }}>
          No {isHidden ? 'hidden' : 'visible'} test cases yet. Click + to add.
        </div>
      ) : list.map((tc, localIdx) => {
        const globalIdx = testCases.indexOf(tc);
        return (
          <div key={globalIdx} style={{ background: T.surf2, borderRadius: 10, padding: 14, marginBottom: 8, border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Case {localIdx + 1}</span>
              <button onClick={() => remove(globalIdx)} style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Input</label>
                <textarea value={tc.input} onChange={e => set(globalIdx, 'input', e.target.value)} rows={3}
                  placeholder="stdin for this test case"
                  style={monoStyle} />
              </div>
              <div>
                <label style={labelStyle}>Expected Output</label>
                <textarea value={tc.expected_output} onChange={e => set(globalIdx, 'expected_output', e.target.value)} rows={3}
                  placeholder="exact expected stdout"
                  style={monoStyle} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {renderGroup(visible, false)}
      {renderGroup(hidden, true)}
    </div>
  );
}

function StarterCodeEditor({ starterCode, onChange }) {
  const [lang, setLang] = useState('python');
  const langs = [
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' },
    { id: 'c', label: 'C' },
    { id: 'javascript', label: 'JavaScript' },
  ];
  const set = (v) => onChange({ ...starterCode, [lang]: v });

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {langs.map(l => (
          <button key={l.id} onClick={() => setLang(l.id)} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: lang === l.id ? T.accent : T.surf2,
            color: lang === l.id ? '#000' : T.muted,
            border: `1px solid ${lang === l.id ? T.accent : T.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{l.label}</button>
        ))}
      </div>
      <textarea
        value={starterCode[lang] || ''}
        onChange={e => set(e.target.value)}
        rows={10}
        style={{ ...monoStyle, resize: 'vertical' }}
        placeholder={`Starter code for ${lang}…`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Problem Form Dialog
// ─────────────────────────────────────────────────────────────────────────────

function ProblemForm({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id;
  const [form,    setForm]    = useState(initial || emptyForm());
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [activeSection, setActiveSection] = useState('basics');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Title is required';
    if (!form.description.trim()) errs.description  = 'Description is required';
    if (!form.difficulty)         errs.difficulty   = 'Select a difficulty';
    if (form.test_cases.length === 0) errs.test_cases = 'At least one test case required';
    const hasVisibleTC = form.test_cases.some(tc => !tc.hidden && tc.input.trim() && tc.expected_output.trim());
    if (!hasVisibleTC) errs.test_cases = 'At least one visible test case (with input + expected output) is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Build clean payload
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        difficulty:  form.difficulty,
        constraints: form.constraints.trim(),
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
        companies:   form.companies.split(',').map(c => c.trim()).filter(Boolean),
        hints:       form.hints.split('\n').map(h => h.trim()).filter(Boolean),
        examples:    form.examples.filter(e => e.input.trim() || e.output.trim()),
        test_cases:  form.test_cases.filter(tc => tc.input.trim() && tc.expected_output.trim()),
        starter_code: form.starter_code,
      };

      let result;
      if (isEdit) {
        result = await api.put(`/coding/admin/problems/${initial.id}`, payload);
      } else {
        result = await api.post('/coding/admin/problems', payload);
      }
      onSave(result.data);
    } catch (e) {
      setErrors({ global: e.response?.data?.error || 'Save failed. Check all fields and try again.' });
    }
    setSaving(false);
  };

  const sections = [
    { id: 'basics',       label: '① Basics'      },
    { id: 'examples',     label: '② Examples'    },
    { id: 'testcases',    label: '③ Test Cases'  },
    { id: 'startercode',  label: '④ Starter Code'},
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '92vw', maxWidth: 900, maxHeight: '92vh',
        background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
            {isEdit ? `✏️ Edit: ${initial.title}` : '➕ New Problem'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', background: T.bg, borderBottom: `1px solid ${T.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              background: 'none', border: 'none', padding: '10px 18px', whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              color: activeSection === s.id ? T.text : T.muted,
              borderBottom: activeSection === s.id ? `2px solid ${T.accent}` : '2px solid transparent',
              fontFamily: 'inherit',
            }}>{s.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {errors.global && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: `1px solid ${T.red}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: T.red, fontSize: 13 }}>
              {errors.global}
            </div>
          )}

          {/* ── Basics ── */}
          {activeSection === 'basics' && (
            <div>
              <Field label="Problem Title *">
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Two Sum"
                  style={{ ...fieldStyle, borderColor: errors.title ? T.red : T.border }} />
                {errors.title && <span style={{ color: T.red, fontSize: 11, marginTop: 4, display: 'block' }}>{errors.title}</span>}
              </Field>

              <Field label="Description *">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={8}
                  placeholder="Full problem description. Use plain text. Line breaks are preserved."
                  style={{ ...fieldStyle, borderColor: errors.description ? T.red : T.border }} />
                {errors.description && <span style={{ color: T.red, fontSize: 11, marginTop: 4, display: 'block' }}>{errors.description}</span>}
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Difficulty *</label>
                  <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                    style={{ ...fieldStyle, color: DIFF_META[form.difficulty]?.color }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="Array, Hash Map, Two Pointers"
                    style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Companies (comma-separated)</label>
                  <input value={form.companies} onChange={e => set('companies', e.target.value)}
                    placeholder="Google, Amazon, Meta"
                    style={fieldStyle} />
                </div>
              </div>

              <Field label="Constraints">
                <textarea value={form.constraints} onChange={e => set('constraints', e.target.value)} rows={4}
                  placeholder={`2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.`}
                  style={monoStyle} />
              </Field>

              <Field label="Hints (one per line, optional)">
                <textarea value={form.hints} onChange={e => set('hints', e.target.value)} rows={3}
                  placeholder={`Try using a hash map.\nThink about what complement you need.`}
                  style={fieldStyle} />
              </Field>
            </div>
          )}

          {/* ── Examples ── */}
          {activeSection === 'examples' && (
            <ExampleEditor examples={form.examples} onChange={v => set('examples', v)} />
          )}

          {/* ── Test Cases ── */}
          {activeSection === 'testcases' && (
            <div>
              {errors.test_cases && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: `1px solid ${T.red}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: T.red, fontSize: 12 }}>
                  ⚠ {errors.test_cases}
                </div>
              )}
              <div style={{ background: 'rgba(255,161,22,0.07)', border: `1px solid ${T.accent}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: T.muted }}>
                💡 <strong style={{ color: T.text }}>Visible</strong> test cases are shown to students. <strong style={{ color: T.text }}>Hidden</strong> ones are only used when evaluating submissions.
                The comparison is exact (trimmed whitespace).
              </div>
              <TestCaseEditor testCases={form.test_cases} onChange={v => set('test_cases', v)} />
            </div>
          )}

          {/* ── Starter Code ── */}
          {activeSection === 'startercode' && (
            <div>
              <div style={{ background: T.bg, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: T.muted, border: `1px solid ${T.border}` }}>
                📝 Provide starter code for each language. Students will see this as their initial template.
              </div>
              <StarterCodeEditor starterCode={form.starter_code} onChange={v => set('starter_code', v)} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: T.muted }}>
            {Object.keys(errors).filter(k => k !== 'global').length > 0 &&
              `${Object.keys(errors).filter(k => k !== 'global').length} field(s) need attention`
            }
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              background: 'none', border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.muted, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              background: T.accent, border: 'none', borderRadius: 8,
              color: '#000', padding: '8px 24px', fontSize: 13, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : isEdit ? '✓ Save Changes' : '✓ Create Problem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirm({ problem, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, maxWidth: 420, width: '90vw', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800 }}>Archive Problem</h3>
        <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          Are you sure you want to archive <strong style={{ color: T.text }}>"{problem.title}"</strong>?
          It will be hidden from students but not permanently deleted.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={run} disabled={loading} style={{ background: T.red, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Archiving…' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCodingProblems() {
  const [problems,  setProblems]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [diffFilter, setDiffFilter] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/coding/admin/problems')
      .then(r => setProblems(r.data || []))
      .catch(() => showToast('Failed to load problems', 'error'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpenEdit = (p) => {
    // Reconstruct form from saved problem data
    const sc = safeParse(p.starter_code, { ...STARTER_TEMPLATE });
    const tc = safeParse(p.test_cases, []);
    const ex = safeParse(p.examples, [{ input: '', output: '', explanation: '' }]);
    const hints = safeParse(p.hints, []);

    setEditing({
      id:           p.id,
      title:        p.title || '',
      description:  p.description || '',
      difficulty:   p.difficulty || 'easy',
      tags:         (p.tags || []).join(', '),
      companies:    (p.companies || []).join(', '),
      constraints:  p.constraints || '',
      hints:        Array.isArray(hints) ? hints.join('\n') : (hints || ''),
      examples:     ex.length > 0 ? ex : [{ input: '', output: '', explanation: '' }],
      test_cases:   tc.length > 0 ? tc : [{ input: '', expected_output: '', hidden: false }],
      starter_code: { ...STARTER_TEMPLATE, ...sc },
      is_active:    p.is_active,
    });
    setShowForm(true);
  };

  const handleSave = (saved) => {
    setShowForm(false);
    setEditing(null);
    showToast(editing ? 'Problem updated successfully' : 'Problem created successfully');
    load();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/coding/admin/problems/${deleting.id}`);
      showToast('Problem archived successfully');
      setDeleting(null);
      load();
    } catch {
      showToast('Failed to archive problem', 'error');
      setDeleting(null);
    }
  };

  const filtered = problems.filter(p => {
    if (diffFilter && p.difficulty !== diffFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = { all: problems.length, easy: 0, medium: 0, hard: 0 };
  problems.forEach(p => { if (stats[p.difficulty] != null) stats[p.difficulty]++; });

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'JetBrains Mono', monospace; background: ${T.bg}; color: ${T.text}; }
        button, select, input, textarea { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        select option { background: ${T.surf}; color: ${T.text}; }
        .acp-row:hover { background: ${T.surf2} !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showForm && (
        <ProblemForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {deleting && <DeleteConfirm problem={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />}

      <div style={{ padding: '28px 32px', fontFamily: "'JetBrains Mono', monospace", color: T.text, minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Coding Problems</h1>
            <p style={{ fontSize: 12, color: T.muted }}>Manage DSA problems, test cases, and examples</p>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
            background: T.accent, border: 'none', borderRadius: 10, color: '#000',
            padding: '10px 22px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}>
            + New Problem
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[['All', stats.all, T.text], ['Easy', stats.easy, '#00b8a3'], ['Medium', stats.medium, '#ffc01e'], ['Hard', stats.hard, '#ff375f']].map(([label, val, color]) => (
            <div key={label} style={{ background: T.surf, borderRadius: 12, padding: '14px 18px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…"
              style={{ width: '100%', background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px 9px 36px', color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
            style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px', color: diffFilter ? DIFF_META[diffFilter]?.color : T.text, fontSize: 13, outline: 'none' }}>
            <option value="">All Difficulty</option>
            {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{DIFF_META[d].label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: T.surf, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 110px 80px 110px 80px 160px', background: T.bg, padding: '10px 18px', borderBottom: `1px solid ${T.border}` }}>
            {['#', 'Title', 'Difficulty', 'Tags', 'Tests', 'Status', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: T.muted, fontSize: 13 }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.muted, fontSize: 13 }}>
              {search || diffFilter ? 'No problems match your filters.' : 'No problems yet. Click "+ New Problem" to create one.'}
            </div>
          ) : filtered.map((p, idx) => {
            const tc = safeParse(p.test_cases, []);
            const visible = tc.filter(t => !t.hidden).length;
            const hidden  = tc.filter(t => t.hidden).length;
            return (
              <div key={p.id} className="acp-row" style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 110px 80px 110px 80px 160px',
                padding: '13px 18px', alignItems: 'center',
                borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}22` : 'none',
                background: p.is_active ? 'transparent' : 'rgba(248,81,73,0.04)',
                transition: 'background 0.12s',
              }}>
                <div style={{ fontSize: 12, color: T.dim }}>{idx + 1}</div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>
                    {(p.tags || []).slice(0, 3).join(' · ')}
                  </div>
                </div>

                <div><DiffBadge d={p.difficulty} /></div>

                <div style={{ fontSize: 11, color: T.muted }}>{(p.tags || []).length} tag{(p.tags || []).length !== 1 ? 's' : ''}</div>

                <div style={{ fontSize: 11, color: T.muted }}>
                  <span style={{ color: T.green }}>{visible}V</span>
                  <span style={{ color: T.dim }}> + </span>
                  <span style={{ color: '#f97316' }}>{hidden}H</span>
                </div>

                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: p.is_active ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)',
                    color: p.is_active ? T.green : T.red,
                  }}>{p.is_active ? 'Active' : 'Archived'}</span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleOpenEdit(p)} style={{
                    background: 'none', border: `1px solid ${T.border}`, borderRadius: 7,
                    color: T.muted, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  }}>✏ Edit</button>
                  <button onClick={() => setDeleting(p)} style={{
                    background: 'none', border: `1px solid ${T.red}22`, borderRadius: 7,
                    color: T.red, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
