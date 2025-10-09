import React from 'react';
import { clsx } from 'clsx';

interface LiquidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'orange' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  onClick,
  variant = 'blue',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  href,
  type = 'button',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
  };

  const variantClasses = {
    blue: clsx(
      'bg-gradient-to-br from-neon-cortex-blue/20 to-neon-cortex-blue/10',
      'border-neon-cortex-blue/30',
      'hover:from-neon-cortex-blue/30 hover:to-neon-cortex-blue/15',
      'hover:shadow-liquid-glow-blue',
      'hover:border-neon-cortex-blue/50'
    ),
    orange: clsx(
      'bg-gradient-to-br from-solar-surge-orange/20 to-solar-surge-orange/10',
      'border-solar-surge-orange/30',
      'hover:from-solar-surge-orange/30 hover:to-solar-surge-orange/15',
      'hover:shadow-liquid-glow-orange',
      'hover:border-solar-surge-orange/50'
    ),
    neutral: clsx(
      'bg-white/5',
      'border-white/20',
      'hover:bg-white/10',
      'hover:border-white/30'
    ),
  };

  const baseClasses = clsx(
    'relative overflow-hidden',
    'backdrop-blur-liquid',
    'border',
    'rounded-xl',
    'font-semibold font-poppins',
    'transition-all duration-300',
    'hover:scale-105 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    fullWidth && 'w-full',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  // Render as link if href is provided
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick}
      >
        {/* Specular Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Button Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </a>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {/* Specular Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default LiquidButton;
