import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cinematicGradients } from '../utils/cinematicEffects';

const EXPLORE = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about-us' },
];
const TOOLS = [
  { label: 'SGPA Calculator', path: '/sgpa-calculator' },
  { label: 'VTU Results', path: '/vtu-result' },
  { label: 'Leaderboard', path: '/leaderboard' },
];
const LEARN = [
  { label: 'Dashboard', path: '/dashboard', auth: true },
  { label: 'Training & certificates', path: '/training', auth: true },
  { label: 'VTU Resources', path: '/vtu-resources', auth: true },
  { label: 'Coding practice', path: '/coding', auth: true },
  { label: 'Community notes', path: '/community-notes', auth: true },
];
const CAREER = [
  { label: 'Internship programs', path: '/internship-programs', auth: true },
  { label: 'Projects marketplace', path: '/projects', auth: true },
  { label: 'Placement drives', path: '/placement-drives', auth: true },
  { label: 'Job opportunities', path: '/job-opportunities', auth: true },
  { label: 'Resume builder', path: '/resume-builder', auth: true },
];
const SUPPORT = [
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
  { label: 'Terms of service', path: '/terms' },
  { label: 'Privacy policy', path: '/privacy-policy' },
];

const GROUPS = [
  { id: 'explore', title: 'Explore', items: EXPLORE },
  { id: 'tools', title: 'Tools', items: TOOLS },
  { id: 'learn', title: 'Learn', items: LEARN },
  { id: 'career', title: 'Career', items: CAREER },
  { id: 'support', title: 'Support', items: SUPPORT },
];

function pathActive(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function groupIsActive(pathname, items) {
  return items.some(i => pathActive(pathname, i.path));
}

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const navRef = useRef(null);

  const navigateSmart = useCallback((path, needsAuth) => {
    const token = localStorage.getItem('token');
    if (needsAuth && !token) {
      navigate('/login', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
    setDropdown(null);
    setOpen(false);
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!dropdown) return undefined;
    const onDoc = e => {
      if (navRef.current && !navRef.current.contains(e.target)) setDropdown(null);
    };
    const onKey = e => {
      if (e.key === 'Escape') setDropdown(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [dropdown]);

  useEffect(() => {
    setDropdown(null);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleDropdown = id => {
    setDropdown(d => (d === id ? null : id));
  };

  const panelStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 10,
    minWidth: 248,
    padding: 8,
    borderRadius: 16,
    background: 'linear-gradient(165deg, rgba(18,14,42,0.97) 0%, rgba(12,10,28,0.98) 100%)',
    backdropFilter: 'blur(22px) saturate(1.35)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.35)',
    border: '1px solid rgba(129,140,248,0.22)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(99,102,241,0.15) inset',
    animation: 'ph-dropdown-in 0.28s cubic-bezier(0.34,1.02,0.64,1) both',
    zIndex: 50,
  };

  const itemBtn = active => ({
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    background: active ? 'rgba(99,102,241,0.14)' : 'transparent',
    border: active ? '1px solid rgba(99,102,241,0.28)' : '1px solid transparent',
    color: active ? '#A5B4FC' : 'rgba(248,250,252,0.88)',
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: 11,
    fontSize: '0.84rem',
    fontWeight: active ? 650 : 500,
    fontFamily: "'Outfit',sans-serif",
    transition: 'background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s',
  });

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: scrolled
          ? 'linear-gradient(180deg, rgba(8,6,22,0.94) 0%, rgba(10,8,28,0.9) 100%)'
          : 'linear-gradient(135deg, #07051a 0%, #0e0a2e 45%, #071428 100%)',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.45)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.45)' : 'none',
        borderBottom: '1px solid rgba(129,140,248,0.12)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease',
        boxShadow: scrolled
          ? '0 8px 40px rgba(0,0,0,0.42), 0 1px 0 rgba(99,102,241,0.08) inset'
          : '0 1px 0 rgba(99,102,241,0.06) inset',
      }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: scrolled ? 0.55 : 0.85,
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.045) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(180deg,black 0%,transparent 100%)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -40,
            left: '12%',
            width: 280,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(4px)',
          }}
        />
        <div style={{
          maxWidth: 1220,
          margin: '0 auto',
          padding: '0 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
          position: 'relative',
        }}>
          <div
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: cinematicGradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 22px rgba(79,70,229,0.45), 0 0 24px rgba(124,58,237,0.2)',
            }}>🎓</div>
            <span
              className="pub-header-logo-text"
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: '1.02rem',
                color: '#F8FAFC',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 18px rgba(99,102,241,0.35)',
              }}
            >
              Campus Connect
            </span>
          </div>

          <nav
            ref={navRef}
            data-ph-nav
            style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'center', padding: '0 12px' }}
          >
            {GROUPS.map(g => {
              const activeGroup = groupIsActive(location.pathname, g.items);
              const isOpen = dropdown === g.id;
              return (
                <div key={g.id} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={e => { e.stopPropagation(); toggleDropdown(g.id); }}
                    style={{
                      background: isOpen || activeGroup
                        ? 'linear-gradient(180deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.06) 100%)'
                        : 'transparent',
                      border: isOpen || activeGroup
                        ? '1px solid rgba(129,140,248,0.35)'
                        : '1px solid transparent',
                      color: activeGroup || isOpen ? '#C7D2FE' : 'rgba(226,232,240,0.82)',
                      cursor: 'pointer',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: '0.82rem',
                      fontWeight: 650,
                      fontFamily: "'Outfit',sans-serif",
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {g.title}
                    <span style={{
                      display: 'inline-block',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.22s ease',
                      fontSize: '0.65rem',
                      opacity: 0.75,
                    }}>▼</span>
                  </button>
                  {isOpen && (
                    <div style={panelStyle} role="menu">
                      {g.items.map(item => {
                        const active = pathActive(location.pathname, item.path);
                        const lock = item.auth && !localStorage.getItem('token');
                        return (
                          <button
                            key={item.path}
                            type="button"
                            role="menuitem"
                            onClick={() => navigateSmart(item.path, !!item.auth)}
                            style={itemBtn(active)}
                            onMouseEnter={e => {
                              if (!active) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.transform = 'translateX(2px)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }
                            }}
                          >
                            <span>{item.label}</span>
                            {lock ? (
                              <span style={{ fontSize: '0.72rem', opacity: 0.65 }} title="Sign in required">🔐</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="pub-login-btn"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(248,250,252,0.9)',
                border: '1px solid rgba(148,163,184,0.25)',
                cursor: 'pointer',
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: '0.84rem',
                fontWeight: 600,
                fontFamily: "'Outfit',sans-serif",
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(199,210,254,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)';
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="pub-register-btn"
              style={{
                background: cinematicGradients.primary,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: '0.84rem',
                fontWeight: 700,
                fontFamily: "'Outfit',sans-serif",
                boxShadow: '0 6px 22px rgba(79,70,229,0.4)',
                transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(79,70,229,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(79,70,229,0.4)';
              }}
            >
              Sign up free
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              style={{
                display: 'none',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                cursor: 'pointer',
                padding: 9,
                borderRadius: 10,
                lineHeight: 1,
              }}
              className="mobile-menu-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </div>
        <div
          aria-hidden
          style={{
            height: 2,
            background: scrolled
              ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(167,139,250,0.45), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)',
            opacity: scrolled ? 1 : 0.65,
            transition: 'opacity 0.3s ease',
          }}
        />
      </header>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'rgba(0,0,0,0.62)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
          />
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 'min(340px, 92vw)',
            background: 'linear-gradient(195deg, #0c0a24 0%, #141036 55%, #0a1628 100%)',
            borderLeft: '1px solid rgba(129,140,248,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideInRight 0.32s cubic-bezier(0.34,1.02,0.64,1) both',
            boxShadow: '-16px 0 48px rgba(0,0,0,0.45)',
          }}>
            <div style={{
              padding: '20px 22px',
              borderBottom: '1px solid rgba(129,140,248,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#F1F5F9', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
                Navigate
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '14px 14px 10px', maxHeight: 'calc(100vh - 188px)', overflowY: 'auto' }}>
              {GROUPS.map(g => (
                <div key={g.id} style={{ marginBottom: 18 }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: 'rgba(165,180,252,0.85)',
                    margin: '0 8px 8px',
                    fontFamily: "'Outfit',sans-serif",
                  }}>
                    {g.title}
                  </div>
                  {g.items.map(item => {
                    const active = pathActive(location.pathname, item.path);
                    const lock = item.auth && !localStorage.getItem('token');
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => navigateSmart(item.path, !!item.auth)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
                          color: active ? '#C7D2FE' : 'rgba(248,250,252,0.9)',
                          border: active ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          padding: '12px 14px',
                          borderRadius: 12,
                          fontSize: '0.88rem',
                          fontWeight: active ? 650 : 500,
                          fontFamily: "'Outfit',sans-serif",
                          marginBottom: 6,
                          transition: 'background 0.15s',
                        }}
                      >
                        <span>{item.label}</span>
                        {lock ? <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>🔐</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{
              padding: '10px 18px 14px',
              borderTop: '1px solid rgba(129,140,248,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: 'linear-gradient(180deg, transparent, rgba(79,70,229,0.08))',
            }}>
              <button
                type="button"
                onClick={() => { navigate('/login'); setOpen(false); }}
                style={{
                  background: 'transparent',
                  color: 'rgba(248,250,252,0.9)',
                  border: '1px solid rgba(148,163,184,0.35)',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { navigate('/register'); setOpen(false); }}
                style={{
                  background: cinematicGradients.primary,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                }}
              >
                Sign up free →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          nav[data-ph-nav] { display: none !important; }
          .pub-login-btn { display: none !important; }
          .pub-register-btn { display: none !important; }
          .mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; }
        }
        @media (max-width: 400px) {
          .pub-header-logo-text { display: none; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.85; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes ph-dropdown-in {
          from { opacity: 0; transform: translateY(-8px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </>
  );
}
