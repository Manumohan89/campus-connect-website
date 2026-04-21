import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [hov,     setHov]     = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Back to top"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: hov
          ? 'linear-gradient(135deg,#4F46E5,#7C3AED)'
          : 'rgba(79,70,229,0.85)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        boxShadow: hov
          ? '0 8px 28px rgba(79,70,229,0.5)'
          : '0 4px 16px rgba(79,70,229,0.35)',
        transform: hov ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'all .22s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        color: 'white',
        animation: 'btt-enter .3s ease',
      }}
    >
      ↑
      <style>{`
        @keyframes btt-enter {
          from { opacity:0; transform:translateY(12px) scale(.9) }
          to   { opacity:1; transform:translateY(0)   scale(1)   }
        }
      `}</style>
    </button>
  );
}
