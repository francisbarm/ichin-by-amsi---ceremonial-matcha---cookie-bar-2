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
      className={`inline-flex items-center gap-2 select-none cursor-pointer shrink-0 transition-transform duration-200 active:scale-95 ${className}`}
    >
      {/* Official Extracted Logo: Chasen whisk + 一秋 + ICHIN MATCHA - COOKIES Y MAS */}
      <img 
        src="/branding/ichin-logo-transparent.png" 
        alt="ICHIN MATCHA - Cookies y Más" 
        className={`h-8 sm:h-10 w-auto object-contain shrink-0 ${
          isWhite ? 'brightness-0 invert' : ''
        }`}
      />

      {/* Official Co-branding Lockup: by/ Amsi */}
      <div className={`flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 border-l shrink-0 ${
        isWhite ? 'border-white/20' : 'border-[#364437]/25'
      }`}>
        <span 
          className={`text-[10px] sm:text-xs font-bold tracking-tight lowercase select-none shrink-0 ${
            isWhite ? 'text-[#D4BE9B]' : 'text-[#5A6D58]'
          }`}
        >
          by/
        </span>

        <img 
          src="/branding/amsi-logo-cropped.png" 
          alt="AMSI GROUP" 
          className={`h-4 sm:h-5 w-auto object-contain shrink-0 ${
            isWhite ? 'brightness-0 invert' : ''
          }`}
        />
      </div>
    </div>
  );
};
