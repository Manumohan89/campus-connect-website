import React from 'react';

export default function WorkshopOptionChip({ label, selected, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: selected
          ? 'rgba(124, 58, 237, 0.25)'
          : 'rgba(255,255,255,0.05)',
        border: selected
          ? '1px solid rgba(168, 85, 247, 0.6)'
          : '1px solid rgba(255,255,255,0.1)',
        color: selected ? '#c084fc' : 'rgba(255,255,255,0.6)',
        boxShadow: selected ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
      }}
    >
      {icon && <span style={{ marginRight: '0.375rem' }}>{icon}</span>}
      {label}
      {selected && <span style={{ marginLeft: '0.375rem', color: '#a855f7' }}>✓</span>}
    </button>
  );
}
