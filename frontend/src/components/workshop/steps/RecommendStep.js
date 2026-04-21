import React from 'react';

export default function RecommendStep({ data, onChange, onBack, onSubmit, isLoading }) {
  const isValid = data.recommend !== null && data.recommend !== undefined;

  const yesActive = data.recommend === true;
  const noActive  = data.recommend === false;

  const choiceBtn = (active, color, shadow) => ({
    flex: 1, padding: '2.5rem 1rem', borderRadius: '1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
    cursor: 'pointer', border: `1px solid ${active ? color + '99' : 'rgba(255,255,255,0.08)'}`,
    background: active ? `${color}26` : 'rgba(255,255,255,0.04)',
    boxShadow: active ? `0 0 40px ${color}33` : 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.6)' }}>
            Final Question
          </span>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginTop: '0.75rem' }}>
            Would you recommend<br /><em style={{ color: '#34d399' }}>this workshop?</em>
          </h2>
        </div>

        {/* Big Yes/No */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '3rem' }}>
          <button style={choiceBtn(yesActive, '#10b981', '10b981')} onClick={() => onChange('recommend', true)}>
            <span style={{ fontSize: '3rem' }}>👍</span>
            <span style={{ fontWeight: 700, fontSize: '1.5rem', color: yesActive ? '#10b981' : 'rgba(255,255,255,0.5)' }}>Yes!</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: yesActive ? '#6ee7b7' : 'rgba(255,255,255,0.2)' }}>Absolutely</span>
          </button>
          <button style={choiceBtn(noActive, '#ef4444', 'ef4444')} onClick={() => onChange('recommend', false)}>
            <span style={{ fontSize: '3rem' }}>👎</span>
            <span style={{ fontWeight: 700, fontSize: '1.5rem', color: noActive ? '#ef4444' : 'rgba(255,255,255,0.5)' }}>No</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: noActive ? '#fca5a5' : 'rgba(255,255,255,0.2)' }}>Not yet</span>
          </button>
        </div>

        {/* Reaction */}
        {yesActive && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'rgba(52,211,153,0.8)', fontSize: '1.125rem' }}>That's amazing! Your endorsement means the world 🌟</p>
          </div>
        )}
        {noActive && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'rgba(239,68,68,0.8)', fontSize: '1.125rem' }}>We appreciate your honesty — it helps us improve 🙏</p>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>← Back</button>
          <button
            onClick={isValid && !isLoading ? onSubmit : undefined}
            disabled={!isValid || isLoading}
            style={{
              flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: 600,
              cursor: isValid && !isLoading ? 'pointer' : 'not-allowed', border: 'none',
              background: isValid ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.05)',
              color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
              boxShadow: isValid ? '0 0 30px rgba(16,185,129,0.4)' : 'none', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block', width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                  borderRadius: '50%', animation: 'workshopSpin 1s linear infinite',
                }} />
                Submitting...
              </>
            ) : '🚀 Submit Feedback'}
          </button>
        </div>
        <style>{`@keyframes workshopSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
