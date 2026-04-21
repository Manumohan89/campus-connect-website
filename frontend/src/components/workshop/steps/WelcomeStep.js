import React from 'react';

const btn = {
  position: 'relative',
  padding: '1.25rem 3rem',
  borderRadius: '1rem',
  color: 'white',
  fontWeight: 600,
  fontSize: '1.125rem',
  letterSpacing: '0.025em',
  cursor: 'pointer',
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  boxShadow: '0 0 40px rgba(124,58,237,0.5)',
  transition: 'transform 0.15s, box-shadow 0.15s',
};

export default function WelcomeStep({ onNext }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '0 1.5rem',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-block', marginBottom: '2rem',
        padding: '0.5rem 1rem', borderRadius: '9999px',
        background: 'rgba(124,58,237,0.15)',
        border: '1px solid rgba(168,85,247,0.3)',
        color: '#a855f7', fontSize: '0.75rem',
        fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Technical Workshop 2024
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: 900, lineHeight: 1.1,
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Your Experience<br /><em>Matters</em>
      </h1>

      {/* Divider */}
      <div style={{
        width: 96, height: 1, marginBottom: '2rem',
        background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
      }} />

      {/* Subtitle */}
      <p style={{
        color: 'rgba(255,255,255,0.5)', fontSize: '1.125rem',
        lineHeight: 1.7, maxWidth: 420, marginBottom: '4rem',
      }}>
        Tell us your journey through this technical workshop.
        <br />Your voice shapes what comes next.
      </p>

      {/* CTA */}
      <button
        style={btn}
        onClick={onNext}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.5)'; }}
      >
        Begin Your Review →
      </button>

      <p style={{ marginTop: '3rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Takes about 3 minutes
      </p>
    </div>
  );
}
