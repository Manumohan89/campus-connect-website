import React, { useState } from 'react';

export default function WorkshopStarRating({ value, onChange, size = 'lg' }) {
  const [hovered, setHovered] = useState(0);

  const fontSize = size === 'sm' ? '1.5rem' : size === 'md' ? '1.875rem' : '2.25rem';

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              transition: 'transform 0.15s',
              filter: filled ? 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' : 'grayscale(0.8)',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {filled ? '⭐' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
