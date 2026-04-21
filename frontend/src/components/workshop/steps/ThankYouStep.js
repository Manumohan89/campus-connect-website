import React, { useEffect, useState } from 'react';
import WorkshopConfetti from '../WorkshopConfetti';
import { Link } from 'react-router-dom';

export default function ThankYouStep() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const fade = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity 0.8s ${delay}s, transform 0.8s ${delay}s`,
  });

  return (
    <>
      <WorkshopConfetti />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', textAlign: 'center',
        padding: '0 1.5rem', position: 'relative', zIndex: 20,
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ ...fade(0.2), fontSize: '5rem', marginBottom: '2rem' }}>🎬</div>

        <h1 style={{
          ...fade(0.5),
          fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 900, lineHeight: 1.2,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Thank You for Being<br />Part of This Journey
        </h1>

        <div style={{
          ...fade(0.9),
          width: 96, height: 1, marginBottom: '2rem',
          background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
        }} />

        <p style={{ ...fade(1.0), fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1rem' }}>
          You helped us grow 🌟
        </p>

        <p style={{ ...fade(1.3), color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: 360, lineHeight: 1.7 }}>
          Your feedback has been recorded. Every word you shared will help us craft a better learning experience.
        </p>

        <div style={{ ...fade(1.6), display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
          {[1,2,3,4,5].map((_, i) => (
            <span key={i} style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.8))' }}>⭐</span>
          ))}
        </div>

        <div style={{ ...fade(2.2), marginTop: '3rem' }}>
          <Link
            to="/login"
            style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}
          >
            BACK TO LOGIN →
          </Link>
        </div>
      </div>
    </>
  );
}
