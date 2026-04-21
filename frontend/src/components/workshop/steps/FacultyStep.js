import React from 'react';
import WorkshopFacultyCard from '../WorkshopFacultyCard';

const FACULTY = [
  { key: 'mohanRating',  name: 'Mohan',  emoji: '👨‍💻', role: 'React & JavaScript' },
  { key: 'raghavRating', name: 'Raghav', emoji: '👨‍🏫', role: 'Node.js & Backend' },
  { key: 'manishRating', name: 'Manish', emoji: '🧑‍💼', role: 'MongoDB & Databases' },
];

const DEFAULT_RATING = { knowledge: 0, clarity: 0, interaction: 0 };

function isComplete(r) { return r && r.knowledge > 0 && r.clarity > 0 && r.interaction > 0; }

export default function FacultyStep({ data, onChange, onNext, onBack }) {
  const isValid = FACULTY.every(f => isComplete(data[f.key]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,158,11,0.6)' }}>
            Step 03 — Faculty
          </span>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginTop: '0.75rem' }}>
            Rate your<br /><em style={{ color: '#f59e0b' }}>instructors</em>
          </h2>
          <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            Your honest feedback helps them grow
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
          {FACULTY.map(f => (
            <WorkshopFacultyCard
              key={f.key}
              name={f.name} emoji={f.emoji} role={f.role}
              value={data[f.key] || DEFAULT_RATING}
              onChange={val => onChange(f.key, val)}
            />
          ))}
        </div>

        {/* Completion */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          {FACULTY.map(f => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isComplete(data[f.key]) ? '#a855f7' : 'rgba(255,255,255,0.2)' }}>
              <span>{isComplete(data[f.key]) ? '✓' : '○'}</span>
              <span>{f.name}</span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>← Back</button>
          <button onClick={isValid ? onNext : undefined} disabled={!isValid} style={{
            flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed', border: 'none',
            background: isValid ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(255,255,255,0.05)',
            color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
            boxShadow: isValid ? '0 0 30px rgba(245,158,11,0.4)' : 'none', transition: 'all 0.2s',
          }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}
