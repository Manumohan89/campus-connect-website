import React from 'react';
import WorkshopStarRating from './WorkshopStarRating';

const CRITERIA = [
  { key: 'knowledge',   label: 'Knowledge Delivery' },
  { key: 'clarity',     label: 'Clarity of Explanation' },
  { key: 'interaction', label: 'Student Interaction' },
];

export default function WorkshopFacultyCard({ name, emoji, role, value, onChange }) {
  const handleChange = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '1.5rem',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(168,85,247,0.3)',
        }}>
          {emoji}
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>{name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{role}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {CRITERIA.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', flex: 1 }}>{label}</span>
            <WorkshopStarRating
              size="sm"
              value={value[key] || 0}
              onChange={val => handleChange(key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
