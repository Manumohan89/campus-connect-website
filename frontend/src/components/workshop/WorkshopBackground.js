import React, { useMemo } from 'react';

export default function WorkshopBackground() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 3}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 12}s`,
    })), []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {/* Deep space */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(76,29,149,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.1) 0%, transparent 50%)',
        backgroundColor: '#050508',
      }} />

      {/* Orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        top: -200, left: -100, borderRadius: '50%', filter: 'blur(80px)',
        background: 'radial-gradient(circle, rgba(76,29,149,0.12) 0%, transparent 70%)',
        animation: 'workshopPulse 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        bottom: -150, right: -100, borderRadius: '50%', filter: 'blur(80px)',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        animation: 'workshopPulse 6s ease-in-out infinite',
      }} />

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left, bottom: '-10px',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: p.id % 3 === 0
            ? 'rgba(168,85,247,0.8)'
            : p.id % 3 === 1
              ? 'rgba(6,182,212,0.6)'
              : 'rgba(255,255,255,0.4)',
          animation: `workshopFloat ${p.duration} ${p.delay} linear infinite`,
        }} />
      ))}

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <style>{`
        @keyframes workshopPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes workshopFloat {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
