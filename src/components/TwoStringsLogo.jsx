import React from 'react';

export const TwoStringsLogo = ({ 
  size = 60, 
  color = '#ff4d6d', 
  showText = true, 
  watermark = false,
  className = '' 
}) => {
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
            stroke="#ff4d6d" 
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
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="100%" stopColor="#ff758c" />
          </linearGradient>
        </defs>
        {/* Left Heart Loop */}
        <path 
          d="M 80,50 C 65,15 25,15 25,45 C 25,75 70,88 80,50 Z" 
          stroke="url(#logoGradient)" 
          strokeWidth="6.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Heart Loop */}
        <path 
          d="M 80,50 C 95,15 135,15 135,45 C 135,75 90,88 80,50 Z" 
          stroke="url(#logoGradient)" 
          strokeWidth="6.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Subtle ribbon knot accent */}
        <circle cx="80" cy="50" r="3.5" fill="#ff4d6d" />
      </svg>

      {showText && (
        <div style={{ marginTop: '4px' }}>
          <span className="logo-brand-text">two strings</span>
        </div>
      )}
    </div>
  );
};

export default TwoStringsLogo;
