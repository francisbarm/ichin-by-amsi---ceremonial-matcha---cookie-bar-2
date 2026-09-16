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
      className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none cursor-pointer shrink-0 transition-transform duration-200 active:scale-95 ${className}`}
    >
      {/* Official Extracted Logo: Chasen whisk + 一秋 + ICHIN MATCHA - COOKIES Y MAS */}
      <img 
        src="/branding/ichin-logo-transparent.png" 
        alt="ICHIN MATCHA - Cookies y Más" 
        className={`h-11 sm:h-13 lg:h-14 w-auto object-contain shrink-0 transition-all ${
          isWhite ? 'brightness-0 invert' : ''
        }`}
      />

      {/* Official Co-branding Lockup: by/ Amsi */}
      <div className={`flex items-center gap-1.5 sm:gap-2 pl-2.5 sm:pl-3.5 border-l-2 shrink-0 ${
        isWhite ? 'border-white/30' : 'border-[#364437]/30'
      }`}>
        <span 
          className={`text-xs sm:text-sm font-black tracking-tight lowercase select-none shrink-0 ${
            isWhite ? 'text-[#D4BE9B]' : 'text-[#455546]'
          }`}
        >
          by/
        </span>

        <div className={isWhite ? 'bg-white/90 px-2 py-0.5 rounded-lg flex items-center shadow-xs' : 'flex items-center'}>
          <img 
            src="/branding/amsi-logo-transparent.png" 
            alt="AMSI GROUP" 
            className="h-5 sm:h-6 lg:h-7 w-auto object-contain shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
