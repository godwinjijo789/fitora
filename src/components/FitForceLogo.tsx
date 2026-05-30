import React from 'react';

interface FitForceLogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textSize?: string;
}

export const FitForceLogo: React.FC<FitForceLogoProps> = ({
  className = '',
  iconClassName = 'w-8 h-8',
  showText = false,
  textSize = 'text-xl'
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="fitforce-logo-container">
      {/* Dynamic 3D SVG Emblem */}
      <svg
        viewBox="0 0 512 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconClassName} transition-transform duration-300 group-hover:scale-105`}
        id="fitforce-logo-svg"
      >
        <defs>
          {/* Flame Gold Orange Gradient for F swoosh */}
          <linearGradient id="fitforceSwooshGrad" x1="150" y1="60" x2="350" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFAA00" />
            <stop offset="40%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#D80000" />
          </linearGradient>

          {/* Barbell Gold Orange Plates */}
          <linearGradient id="plateOrangeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFA600" />
            <stop offset="100%" stopColor="#FF3D00" />
          </linearGradient>

          {/* Silver/Metallic Details */}
          <linearGradient id="silverMetallic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5F7FA" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Core Red Glow */}
          <filter id="fitforceGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- BARBELL BACKGROUND --- */}
        {/* Left Side Plates */}
        <g id="barbell-left-plates" opacity="0.95">
          {/* Inner Plate */}
          <rect x="150" y="110" width="14" height="60" rx="7" fill="url(#plateOrangeGrad)" />
          {/* Middle Plate */}
          <rect x="132" y="117" width="14" height="46" rx="6" fill="url(#plateOrangeGrad)" />
          {/* Outer Plate */}
          <rect x="114" y="125" width="14" height="30" rx="4" fill="url(#plateOrangeGrad)" />
          {/* Outer Bar Cap */}
          <rect x="102" y="134" width="8" height="12" rx="2" fill="url(#plateOrangeGrad)" />
        </g>

        {/* Central Steel Connection/Bars */}
        <rect x="164" y="137" width="184" height="6" fill="url(#silverMetallic)" />
        {/* Left Collar Sleeve */}
        <rect x="164" y="125" width="6" height="30" rx="1" fill="url(#silverMetallic)" />
        {/* Right Collar Sleeve */}
        <rect x="342" y="125" width="6" height="30" rx="1" fill="url(#silverMetallic)" />

        {/* Right Side Plates */}
        <g id="barbell-right-plates" opacity="0.95">
          {/* Inner Plate */}
          <rect x="348" y="110" width="14" height="60" rx="7" fill="url(#plateOrangeGrad)" />
          {/* Middle Plate */}
          <rect x="366" y="117" width="14" height="46" rx="6" fill="url(#plateOrangeGrad)" />
          {/* Outer Plate */}
          <rect x="384" y="125" width="14" height="30" rx="4" fill="url(#plateOrangeGrad)" />
          {/* Outer Bar Cap */}
          <rect x="402" y="134" width="8" height="12" rx="2" fill="url(#plateOrangeGrad)" />
        </g>

        {/* --- DYNAMIC SYMBOLIC F SWOOSH & EMBLEM CURVES --- */}
        {/* Swooping curved pointed wing that underlines the emblem and swoops up */}
        <path
          d="M 180 200 C 180 240, 240 265, 330 220 C 350 210, 360 195, 360 190 C 360 190, 355 205, 330 225 C 240 280, 170 240, 175 195 Z"
          fill="url(#fitforceSwooshGrad)"
          filter="url(#fitforceGlow)"
        />

        {/* The Bold Stylized 'F' Backbone and top wing */}
        <path
          d="M 230 190 
             C 210 190, 210 115, 255 115 
             L 370 115 
             C 385 115, 395 105, 360 90 
             L 240 90 
             C 190 90, 180 180, 215 220 
             C 230 235, 290 290, 260 310 
             C 240 320, 275 295, 290 280 
             C 335 235, 325 190, 230 190 Z"
          fill="url(#fitforceSwooshGrad)"
        />

        {/* Middle Cross-Bar Swoosh of the F */}
        <path
          d="M 245 165 L 340 165 C 350 165, 355 158, 345 150 L 252 150 C 248 150, 245 155, 245 165 Z"
          fill="url(#fitforceSwooshGrad)"
        />
      </svg>

      {/* Modern, bold 3D aspect silver typography */}
      {showText && (
        <div className="flex flex-col gap-0">
          <span className={`${textSize} font-black tracking-widest text-white uppercase font-sans leading-none`}>
            FitForce
          </span>
          <span className="text-xs font-black tracking-widest text-red-600 uppercase font-sans leading-none">
            By Jijo
          </span>
        </div>
      )}
    </div>
  );
};
