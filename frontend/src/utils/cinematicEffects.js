/**
 * Cinematic Design Effects & Utilities
 * Film-like aesthetic with blur, depth, lighting, and motion
 */

export const cinematicStyles = {
  // Cinematic blur backdrop
  blurBackdrop: {
    backdropFilter: 'blur(12px) saturate(1.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
  },

  // Deep shadow for cinematic depth
  cinematicShadow: {
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },

  // Elevated card with cinematic lighting
  cinematicCard: {
    background: 'linear-gradient(135deg, rgba(79,70,229,0.05) 0%, rgba(124,58,237,0.02) 100%)',
    boxShadow: '0 8px 32px rgba(79, 70, 229, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(129, 140, 248, 0.15)',
  },

  // Dark mode cinematic card
  cinematicCardDark: {
    background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.03) 100%)',
    boxShadow: '0 8px 32px rgba(79, 70, 229, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(129, 140, 248, 0.2)',
    backdropFilter: 'blur(8px)',
  },

  // Cinematic text styling
  cinematicText: {
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    letterSpacing: '0.01em',
  },

  // Film grain overlay
  filmGrain: {
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
    pointerEvents: 'none',
  },

  // Vignette effect (dark edges)
  vignette: {
    background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.2) 100%)',
    pointerEvents: 'none',
  },
};

// Cinematic gradient presets
export const cinematicGradients = {
  primary: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  secondary: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  danger: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  coolDark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
};

// Cinematic animations
export const cinematicAnimations = `
  @keyframes cinematicGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.3), inset 0 0 20px rgba(79, 70, 229, 0.1); }
    50% { box-shadow: 0 0 40px rgba(79, 70, 229, 0.5), inset 0 0 30px rgba(79, 70, 229, 0.15); }
  }

  @keyframes slideInCinematic {
    from {
      opacity: 0;
      transform: translateY(20px);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  @keyframes fadeInCinematic {
    from { opacity: 0; filter: blur(10px); }
    to { opacity: 1; filter: blur(0); }
  }

  @keyframes scaleInCinematic {
    from {
      opacity: 0;
      transform: scale(0.95);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }

  .cinematic-glow { animation: cinematicGlow 3s ease-in-out infinite; }
  .slide-in-cinematic { animation: slideInCinematic 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .fade-in-cinematic { animation: fadeInCinematic 0.8s ease-out forwards; }
  .scale-in-cinematic { animation: scaleInCinematic 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
`;

// Helper function for cinematic text color based on theme
export const getCinematicTextColor = (isDarkMode) => {
  return isDarkMode ? '#F1F5F9' : '#0F172A';
};

// Helper function for cinematic secondary text
export const getCinematicSecondaryColor = (isDarkMode) => {
  return isDarkMode ? '#94A3B8' : '#475569';
};

// Apply cinematic card styling to component
export const applycinematicCard = (isDarkMode) => {
  return isDarkMode ? cinematicStyles.cinematicCardDark : cinematicStyles.cinematicCard;
};

// Create cinematic gradient overlay component props
export const cinematicOverlay = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)',
  pointerEvents: 'none',
};

export default cinematicStyles;
