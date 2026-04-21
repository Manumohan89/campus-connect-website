import React from 'react';
import WorkshopStarRating from '../WorkshopStarRating';
import WorkshopOptionChip from '../WorkshopOptionChip';

const ENJOYED_OPTIONS = [
  { label: 'Hands-on Coding', icon: '💻' },
  { label: 'Concepts',        icon: '🧠' },
  { label: 'Interaction',     icon: '🤝' },
  { label: 'Projects',        icon: '🚀' },
];

const RATING_LABELS = ['', 'Needs major improvement', 'Below expectations', 'Met expectations', 'Really good!', 'Absolutely outstanding! 🌟'];

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '2rem',
  backdropFilter: 'blur(12px)',
};

export default function ExperienceStep({ data, onChange, onNext, onBack }) {
  const isValid = data.overallRating > 0 && data.likedMost;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '5rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(168,85,247,0.6)' }}>
            Step 01 — General
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'white',
            lineHeight: 1.2, marginTop: '0.75rem',
          }}>
            How was the<br /><em style={{ color: '#a855f7' }}>overall experience?</em>
          </h2>
        </div>

        <div style={card}>
          {/* Star rating */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Overall Workshop Rating
            </p>
            <WorkshopStarRating value={data.overallRating} onChange={v => onChange('overallRating', v)} size="lg" />
            {data.overallRating > 0 && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(192,132,252,0.7)' }}>
                {RATING_LABELS[data.overallRating]}
              </p>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '2.5rem' }} />

          {/* Enjoyed */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
              What did you enjoy the most?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {ENJOYED_OPTIONS.map(opt => (
                <WorkshopOptionChip
                  key={opt.label}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.likedMost === opt.label}
                  onClick={() => onChange('likedMost', opt.label)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            ← Back
          </button>
          <button
            onClick={isValid ? onNext : undefined}
            disabled={!isValid}
            style={{
              flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: 600, cursor: isValid ? 'pointer' : 'not-allowed',
              background: isValid ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.05)',
              color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
              border: 'none',
              boxShadow: isValid ? '0 0 30px rgba(124,58,237,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
