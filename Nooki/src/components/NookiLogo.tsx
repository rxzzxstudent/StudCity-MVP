'use client';

import React, { useId } from 'react';

export interface NookiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'stacked' | 'horizontal' | 'auto' | 'icon-only';
  showText?: boolean;
  animated?: boolean;
  textColor?: 'dark' | 'white';
}

export const NookiLogo: React.FC<NookiLogoProps> = ({
  className = '',
  size = 'md',
  layout = 'auto',
  showText = true,
  animated = true,
  textColor = 'dark',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `nookiGrad-${uniqueId}`;

  // Dimensions based on size
  const iconSize = {
    xs: 26,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 60,
  }[size];

  const textSizeClasses = {
    xs: 'text-sm font-black',
    sm: 'text-base font-black',
    md: 'text-xl font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  }[size];

  const primaryTextColor = textColor === 'white' ? 'text-white' : 'text-slate-900';
  const brandAccentColor = textColor === 'white' ? 'text-amber-300' : 'text-blue-600';

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${
        animated ? 'group cursor-pointer' : ''
      } ${className}`}
    >
      {/* High Fidelity Squircle Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 transition-transform duration-300 ease-out ${
            animated ? 'group-hover:scale-105 group-hover:-translate-y-0.5 shadow-sm' : ''
          }`}
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.3))',
          }}
        >
          <defs>
            {/* Vibrant Modern Gradient (Deep Blue to Cyan & Indigo) */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Subtle Inner Glow */}
            <linearGradient id={`${gradId}-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Sparkle Glow */}
            <linearGradient id={`${gradId}-sparkle`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Squircle Base */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="26"
            fill={`url(#${gradId})`}
          />

          {/* Top Gloss Highlight */}
          <rect
            x="2"
            y="2"
            width="96"
            height="48"
            rx="26"
            fill={`url(#${gradId}-inner)`}
            className="pointer-events-none"
          />

          {/* Stylized 'N' Beacon / Radar Map Spot */}
          {/* Left Bar */}
          <rect x="24" y="26" width="11" height="48" rx="5.5" fill="#FFFFFF" />
          
          {/* Right Bar */}
          <rect x="65" y="26" width="11" height="48" rx="5.5" fill="#FFFFFF" />
          
          {/* Diagonal Smart Connection */}
          <path
            d="M33 30 L67 70"
            stroke="#FFFFFF"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Flash / Smart Sparkle dot at top right */}
          <circle cx="70.5" cy="31.5" r="5" fill={`url(#${gradId}-sparkle)`} />
        </svg>
      </div>

      {/* Wordmark Typography */}
      {showText && layout !== 'icon-only' && (
        <div className="flex items-center tracking-tight select-none">
          <span className={`${textSizeClasses} ${primaryTextColor} font-black tracking-tight`}>
            nooki
          </span>
          <span className={`${textSizeClasses} ${brandAccentColor} font-black ml-0.5`}>
            .
          </span>
        </div>
      )}
    </div>
  );
};
