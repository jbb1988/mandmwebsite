import React from 'react';
import { clsx } from 'clsx';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'blue' | 'orange' | 'neutral';
  intensity?: 'light' | 'medium' | 'strong';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  variant = 'neutral',
  intensity = 'medium',
  rounded = 'xl',
  padding = 'md',
  glow = false,
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const blurClasses = {
    light: 'backdrop-blur-md',
    medium: 'backdrop-blur-liquid',
    strong: 'backdrop-blur-liquid-strong',
  };

  const variantClasses = {
    blue: clsx(
      'bg-gradient-to-br from-neon-cortex-blue/10 via-transparent to-transparent',
      'border-neon-cortex-blue/20',
      glow && 'shadow-liquid-glow-blue'
    ),
    orange: clsx(
      'bg-gradient-to-br from-solar-surge-orange/10 via-transparent to-transparent',
      'border-solar-surge-orange/20',
      glow && 'shadow-liquid-glow-orange'
    ),
    neutral: clsx(
      'bg-white/5',
      'border-white/10',
      glow && 'shadow-liquid'
    ),
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden',
        'border',
        blurClasses[intensity],
        roundedClasses[rounded],
        paddingClasses[padding],
        variantClasses[variant],
        'transition-all duration-300',
        className
      )}
    >
      {/* Specular Highlight */}
      <div className="specular-highlight" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default LiquidGlass;
