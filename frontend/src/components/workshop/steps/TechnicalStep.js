import React from 'react';
import WorkshopOptionChip from '../WorkshopOptionChip';

const TECH_QUESTIONS = [
  { key: 'reactConfidence',   label: 'React Confidence',         icon: '⚛️', options: ['Beginner', 'Moderate', 'Confident'] },
  { key: 'jsUnderstanding',   label: 'JavaScript Understanding', icon: '🟡', options: ['Poor', 'Average', 'Good', 'Excellent'] },
  { key: 'nodeClarity',       label: 'Node.js Clarity',          icon: '🟢', options: ['Poor', 'Average', 'Good', 'Excellent'] },
  { key: 'mongodbConfidence', label: 'MongoDB Confidence',       icon: '🍃', options: ['Not confident', 'Somewhat', 'Confident'] },
];

const TOPICS = ['React', 'JavaScript', 'Node.js', 'MongoDB'];

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '2rem',
  maxHeight: '60vh',
  overflowY: 'auto',
  backdropFilter: 'blur(12px)',
};

export default function TechnicalStep({ data, onChange, onNext, onBack }) {
  const isValid =
    data.reactConfidence && data.jsUnderstanding && data.nodeClarity &&
    data.mongodbConfidence && data.bestTopic && data.improvementTopic;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(6,182,212,0.6)' }}>
            Step 02 — Technical
          </span>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginTop: '0.75rem' }}>
            Rate your<br /><em style={{ color: '#22d3ee' }}>technical growth</em>
          </h2>
        </div>

        <div style={card}>
          {TECH_QUESTIONS.map((q, qi) => (
            <div key={q.key} style={{ marginBottom: qi < TECH_QUESTIONS.length - 1 ? '2rem' : '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span>{q.icon}</span>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>{q.label}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {q.options.map(opt => (
                  <WorkshopOptionChip key={opt} label={opt} selected={data[q.key] === opt} onClick={() => onChange(q.key, opt)} />
                ))}
              </div>
            </div>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>🏆 Most useful topic</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TOPICS.map(t => (
                <WorkshopOptionChip key={t} label={t} selected={data.bestTopic === t} onClick={() => onChange('bestTopic', t)} />
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>🔧 Topic needing most improvement</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TOPICS.map(t => (
                <WorkshopOptionChip key={t} label={t} selected={data.improvementTopic === t} onClick={() => onChange('improvementTopic', t)} />
              ))}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>← Back</button>
          <button onClick={isValid ? onNext : undefined} disabled={!isValid} style={{
            flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed', border: 'none',
            background: isValid ? 'linear-gradient(135deg, #0891b2, #06b6d4)' : 'rgba(255,255,255,0.05)',
            color: isValid ? 'white' : 'rgba(255,255,255,0.2)',
            boxShadow: isValid ? '0 0 30px rgba(6,182,212,0.4)' : 'none', transition: 'all 0.2s',
          }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}
