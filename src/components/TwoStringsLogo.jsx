import React from 'react';

export const TwoStringsLogo = ({ 
  size = 60, 
  color = '#ff4d6d', 
  textColor = null,
  showText = true, 
  watermark = false,
  className = '' 
}) => {
  const isWhite = color === '#ffffff' || color === 'white' || textColor === '#ffffff' || textColor === 'white';
  const resolvedTextColor = textColor || (isWhite ? '#ffffff' : color);
  const gradId = `logoGradient_${(color || 'default').replace(/[^a-zA-Z0-9]/g, '')}`;

  if (watermark) {
    return (
      <div className={`watermark-logo ${className}`}>
        <svg 
          width="240" 
          height="140" 
          viewBox="0 0 200 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.06 }}
        >
          <path 
            d="M 50,60 C 20,20 10,70 50,95 C 90,120 100,60 100,60 C 100,60 110,120 150,95 C 190,70 180,20 150,60 C 120,95 100,60 100,60 C 100,60 80,95 50,60 Z" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`logo-container ${className}`} style={{ textAlign: 'center' }}>
      {/* Two Strings Double-Heart / Infinity Logo */}
      <svg 
        width={size} 
        height={size * 0.65} 
        viewBox="0 0 160 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isWhite ? 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))' : 'none',
          display: 'inline-block'
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWhite ? '#ffffff' : color} />
            <stop offset="100%" stopColor={isWhite ? '#ffe4e6' : '#ff758c'} />
          </linearGradient>
        </defs>
        {/* Left Heart Loop */}
        <path 
          d="M 80,50 C 65,15 25,15 25,45 C 25,75 70,88 80,50 Z" 
          stroke={`url(#${gradId})`} 
          strokeWidth="6.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Heart Loop */}
        <path 
          d="M 80,50 C 95,15 135,15 135,45 C 135,75 90,88 80,50 Z" 
          stroke={`url(#${gradId})`} 
          strokeWidth="6.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Subtle ribbon knot accent */}
        <circle cx="80" cy="50" r="3.5" fill={isWhite ? '#ffffff' : color} />
      </svg>

      {showText && (
        <div style={{ marginTop: '4px' }}>
          <span 
            className="logo-brand-text"
            style={{ 
              color: resolvedTextColor,
              textShadow: isWhite ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none'
            }}
          >
            two strings
          </span>
        </div>
      )}
    </div>
  );
};

export default TwoStringsLogo;
