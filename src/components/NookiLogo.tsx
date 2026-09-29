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
      {/* High Fidelity Squircle Icon with Official Nooki Friendly Eyes */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 transition-transform duration-300 ease-out rounded-2xl shadow-xs ${
            animated ? 'group-hover:scale-105 group-hover:-translate-y-0.5' : ''
          }`}
        >
          <rect width="160" height="160" rx="38" fill="#176BFF" />
          <g transform="translate(16 54) scale(.30)">
            <g fill="none" stroke="#FFFFFF" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
              <path d="M28 137V34l78 103V34" />
              <circle cx="162" cy="91" r="43" />
              <circle cx="245" cy="91" r="43" />
              <circle cx="172" cy="94" r="9" fill="#FFFFFF" stroke="none" />
              <circle cx="235" cy="94" r="9" fill="#FFFFFF" stroke="none" />
              <path d="M307 34v103M307 96l55-49M326 79l45 58" />
              <path d="M405 63v74" />
              <circle cx="405" cy="31" r="15" fill="#FFFFFF" stroke="none" />
            </g>
          </g>
        </svg>
      </div>

      {/* Wordmark Typography */}
      {showText && layout !== 'icon-only' && (
        <div className="flex items-center tracking-tight select-none">
          <span className={`${textSizeClasses} ${primaryTextColor} font-black tracking-tight`}>
            Nooki
          </span>
        </div>
      )}
    </div>
  );
};
