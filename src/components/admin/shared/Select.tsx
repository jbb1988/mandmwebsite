'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  size = 'md',
}: SelectProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-sm rounded-lg'
    : 'px-4 py-2 rounded-xl';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-colors ${sizeClasses} ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
