import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'white';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', onClick }) => {
  const isWhite = variant === 'white';

  return (
    <div 
      id="brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
    >
      {/* Official Extracted Logo: Chasen whisk + 一秋 + ICHIN MATCHA - COOKIES Y MAS */}
      <img 
        src="/branding/ichin-logo-transparent.png" 
        alt="ICHIN MATCHA - Cookies y Más" 
        className={`h-9 sm:h-11 w-auto object-contain ${
          isWhite ? 'brightness-0 invert' : ''
        }`}
      />

      {/* Co-branding Lockup with transparent AMSI GROUP */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-[#E6DFD4]">
        <span 
          className={`text-[9px] sm:text-[10px] font-medium lowercase tracking-wider ${
            isWhite ? 'text-[#FAF8F4]/80' : 'text-[#75786E]'
          }`}
        >
          by
        </span>

        <img 
          src="/branding/amsi-logo-transparent.png" 
          alt="AMSI GROUP" 
          className={`h-4 sm:h-5 object-contain ${
            isWhite ? 'brightness-0 invert' : ''
          }`}
        />
      </div>
    </div>
  );
};
