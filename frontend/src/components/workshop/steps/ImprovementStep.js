import React from 'react';

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(12px)' };
const taBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontFamily: 'inherit', resize: 'none', width: '100%', padding: '1rem', fontSize: '0.9375rem', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

export default function ImprovementStep({ data, onChange, onNext, onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(236,72,153,0.6)' }}>
            Step 04 — Improvement
          </span>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginTop: '0.75rem' }}>
            Help us<br /><em style={{ color: '#ec4899' }}>do better</em>
          </h2>
          <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            Both fields are optional but incredibly valuable
          </p>
        </div>

        <div style={card}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              What can we improve?
            </label>
            <textarea
              style={taBase}
              rows={4}
              placeholder="Pacing, depth of content, teaching style, resources..."
              value={data.improvement}
              onChange={e => onChange('improvement', e.target.value)}
              maxLength={1000}
              onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>
              {data.improvement.length}/1000
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Suggestions for future workshops
            </label>
            <textarea
              style={taBase}
              rows={4}
              placeholder="Topics to add, format changes, guest speakers, resources..."
              value={data.suggestions}
              onChange={e => onChange('suggestions', e.target.value)}
              maxLength={1000}
              onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>
              {data.suggestions.length}/1000
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>← Back</button>
          <button onClick={onNext} style={{
            flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, #be185d, #ec4899)',
            color: 'white', boxShadow: '0 0 30px rgba(236,72,153,0.4)', transition: 'all 0.2s',
          }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}
