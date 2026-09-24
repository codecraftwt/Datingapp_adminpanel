import React from 'react';
import loginBanner from '../assets/login_banner.png';

export const CoupleBanner = ({ 
  title = "Discover Adventure", 
  subtitle = "Find your perfect match & explore meaningful connections together" 
}) => {
  return (
    <div className="couple-banner">
      <img 
        src={loginBanner} 
        alt="Dating App Banner" 
        className="banner-img" 
      />
      
      {/* Soft gradient overlay for text readability */}
      <div className="banner-scrim-overlay" />

      {/* Customizable Banner Text */}
      <div className="banner-text-overlay">
        <h1 className="banner-title">{title}</h1>
        <p className="banner-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default CoupleBanner;
