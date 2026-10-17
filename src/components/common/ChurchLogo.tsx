import React from 'react';

export interface ChurchLogoProps {
  variant?: 'horizontal' | 'stacked' | 'emblem' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  theme?: 'copper' | 'white' | 'dark';
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = false,
  subtitleText = 'ERP GESTÃO 360º PARA IGREJA',
  theme = 'copper'
}) => {
  // Color tokens matching the official copper brand "Logo Igreja Batista Nacional em Cobre"
  const copperMain = theme === 'white' ? '#FFFFFF' : theme === 'dark' ? '#0F172A' : '#B46A38';
  const copperDark = theme === 'white' ? '#F1F5F9' : theme === 'dark' ? '#020617' : '#965225';
  const copperLight = theme === 'white' ? '#E2E8F0' : theme === 'dark' ? '#1E293B' : '#CF824E';

  // Dimension helpers
  const sizeMap = {
    xs: { height: 26, emblemSize: 24, fontSize: 'text-[11px]' },
    sm: { height: 36, emblemSize: 34, fontSize: 'text-xs' },
    md: { height: 48, emblemSize: 44, fontSize: 'text-sm' },
    lg: { height: 68, emblemSize: 64, fontSize: 'text-base' },
    xl: { height: 96, emblemSize: 88, fontSize: 'text-lg' }
  }[size];

  // SVG Mark: Stylized Flame + 3 Fellowship / Worship Figures + Open Bible Base
  const renderEmblem = (w: number, h: number) => (
    <svg 
      viewBox="0 0 160 170" 
      width={w} 
      height={h} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-label="Emblema Oficial IBNS Sapiranga"
    >
      <defs>
        <linearGradient id={`copper-grad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={copperLight} />
          <stop offset="50%" stopColor={copperMain} />
          <stop offset="100%" stopColor={copperDark} />
        </linearGradient>
        <linearGradient id={`copper-glow-${size}-${theme}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={copperDark} />
          <stop offset="100%" stopColor={copperLight} />
        </linearGradient>
      </defs>

      {/* Flame rising gracefully on the left */}
      <path
        d="M 68 8 C 65 30 52 50 40 70 C 26 94 24 116 32 136 C 35 144 40 151 46 156 C 36 148 31 138 29 125 C 26 102 34 82 46 62 C 57 44 67 27 68 8 Z"
        fill={`url(#copper-grad-${size}-${theme})`}
      />

      {/* Central figure head */}
      <circle cx="75" cy="74" r="13" fill={`url(#copper-grad-${size}-${theme})`} />

      {/* Left figure head */}
      <circle cx="48" cy="92" r="10.5" fill={`url(#copper-grad-${size}-${theme})`} />

      {/* Right figure head */}
      <circle cx="102" cy="92" r="10.5" fill={`url(#copper-grad-${size}-${theme})`} />

      {/* Central figure body loop */}
      <path
        d="M 57 142 C 55 125 61 106 75 106 C 89 106 95 125 93 142 C 86 140 81 136 75 136 C 69 136 64 140 57 142 Z"
        fill={`url(#copper-glow-${size}-${theme})`}
      />

      {/* Left figure body loop */}
      <path
        d="M 33 148 C 30 135 37 116 48 116 C 56 116 61 127 63 138 C 55 141 43 145 33 148 Z"
        fill={`url(#copper-grad-${size}-${theme})`}
      />

      {/* Right figure body loop */}
      <path
        d="M 117 148 C 120 135 113 116 102 116 C 94 116 89 127 87 138 C 95 141 107 145 117 148 Z"
        fill={`url(#copper-grad-${size}-${theme})`}
      />

      {/* Base Open Bible / Wings / Foundation (Left Leaf) */}
      <path
        d="M 35 152 C 48 150 63 154 75 166 C 73 153 60 144 43 145 C 38 145 36 148 35 152 Z"
        fill={`url(#copper-grad-${size}-${theme})`}
      />

      {/* Base Open Bible / Wings / Foundation (Right Leaf) */}
      <path
        d="M 115 152 C 102 150 87 154 75 166 C 77 153 90 144 107 145 C 112 145 114 148 115 152 Z"
        fill={`url(#copper-grad-${size}-${theme})`}
      />
    </svg>
  );

  // If emblem only (e.g. collapsed icon, favicon)
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(sizeMap.emblemSize, sizeMap.emblemSize)}
      </div>
    );
  }

  // Stacked Layout (Ideal for Login Portal and Centered Cards)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Emblem on top */}
        <div className="mb-2 transition-transform duration-300 hover:scale-105">
          {renderEmblem(sizeMap.emblemSize * 1.4, sizeMap.emblemSize * 1.4)}
        </div>

        {/* Big IBNS Brand */}
        <div 
          className="font-black tracking-tight leading-none text-3xl sm:text-4xl md:text-5xl"
          style={{ color: copperMain, letterSpacing: '0.04em' }}
        >
          IBNS
        </div>

        {/* Church Name Subtitle */}
        <div 
          className="font-bold tracking-widest text-[11px] sm:text-xs uppercase mt-1.5"
          style={{ color: copperMain, letterSpacing: '0.22em' }}
        >
          IGREJA BATISTA NACIONAL
        </div>

        {/* City Line */}
        <div 
          className="font-extrabold tracking-widest text-[10px] sm:text-[11px] uppercase mt-0.5 flex items-center justify-center gap-2"
          style={{ color: copperLight, letterSpacing: '0.3em' }}
        >
          <span className="w-4 h-[1.5px]" style={{ backgroundColor: copperMain }} />
          <span>DE SAPIRANGA</span>
          <span className="w-4 h-[1.5px]" style={{ backgroundColor: copperMain }} />
        </div>

        {/* Explicit requested text: ERP GESTÃO 360º PARA IGREJA */}
        {showSubtitle && (
          <div className="mt-3.5 pt-2.5 border-t border-amber-500/20 w-full max-w-[320px]">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase shadow-xs">
              {subtitleText}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact Layout (for mobile headers or small badges)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        {renderEmblem(sizeMap.emblemSize, sizeMap.emblemSize)}
        <div className="flex flex-col leading-tight">
          <span className="font-black text-base tracking-wide" style={{ color: copperMain }}>
            IBNS
          </span>
          <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: copperLight }}>
            Sapiranga / RS
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout (for Top Header, Desktop Navbar, Reports Header)
  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 select-none ${className}`}>
      {/* Official Emblem */}
      <div className="shrink-0 flex items-center justify-center">
        {renderEmblem(sizeMap.emblemSize, sizeMap.emblemSize)}
      </div>

      {/* Typography side */}
      <div className="flex flex-col justify-center leading-tight">
        <div 
          className="font-black tracking-tight leading-none text-xl sm:text-2xl"
          style={{ color: copperMain, letterSpacing: '0.04em' }}
        >
          IBNS
        </div>
        <div 
          className="font-bold tracking-widest text-[9px] sm:text-[10px] uppercase mt-0.5"
          style={{ color: copperMain, letterSpacing: '0.18em' }}
        >
          IGREJA BATISTA NACIONAL
        </div>
        <div 
          className="font-extrabold tracking-widest text-[8px] sm:text-[9px] uppercase mt-0.5 flex items-center gap-1.5"
          style={{ color: copperLight, letterSpacing: '0.22em' }}
        >
          <span className="w-2.5 h-[1px]" style={{ backgroundColor: copperMain }} />
          <span>DE SAPIRANGA</span>
          <span className="w-2.5 h-[1px]" style={{ backgroundColor: copperMain }} />
        </div>

        {showSubtitle && (
          <div className="mt-1">
            <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wider">
              {subtitleText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
