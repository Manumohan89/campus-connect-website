import React from 'react';

const STEP_LABELS = ['Welcome', 'Experience', 'Technical', 'Faculty', 'Improvement', 'Recommend', 'Done'];

export default function WorkshopProgressBar({ currentStep, totalSteps }) {
  const pct = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 50, padding: '1.25rem 1.5rem 0.75rem',
    }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {STEP_LABELS[currentStep] || ''}
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div style={{
          height: '2px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 8px rgba(168,85,247,0.6)',
          }} />
        </div>
      </div>
    </div>
  );
}
