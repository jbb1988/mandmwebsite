'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronDown } from 'lucide-react';

interface QuickDatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  onClose?: () => void;
  compact?: boolean;
  disabled?: boolean;
}

const quickOptions = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
];

export function QuickDatePicker({
  value,
  onChange,
  onClose,
  compact = false,
  disabled = false,
}: QuickDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onChange(date.toISOString());
    setIsOpen(false);
    onClose?.();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
    onClose?.();
  };

  const formattedValue = value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const isOverdue = value && new Date(value) < new Date();

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          value
            ? isOverdue
              ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
              : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
            : 'bg-white/10 hover:bg-white/20 text-white/60'
        }`}
        title={value ? `Follow-up: ${formattedValue}` : 'Set follow-up'}
      >
        <Calendar className="w-3 h-3" />
        {!compact && (
          <>
            <span className="hidden sm:inline">
              {formattedValue || 'Follow-up'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-[#1B1F39] border border-white/20 rounded-xl shadow-xl p-2 min-w-[140px]">
          {/* Quick options */}
          {quickOptions.map((option) => (
            <button
              key={option.days}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickSelect(option.days);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              {option.label}
            </button>
          ))}

          {/* Clear option if there's a value */}
          {value && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleClear}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Clear follow-up
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default QuickDatePicker;
