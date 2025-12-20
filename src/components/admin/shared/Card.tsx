'use client';

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
  glowColor?: 'cyan' | 'purple' | 'emerald' | 'orange';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  glow = false,
  glowColor = 'cyan',
  onClick
}: CardProps) {
  const baseClasses = 'rounded-2xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  const glowClasses = {
    cyan: 'shadow-lg shadow-cyan-500/10',
    purple: 'shadow-lg shadow-purple-500/10',
    emerald: 'shadow-lg shadow-emerald-500/10',
    orange: 'shadow-lg shadow-orange-500/10',
  };

  const glowClass = glow ? glowClasses[glowColor] : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Card;
