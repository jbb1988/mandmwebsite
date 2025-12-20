'use client';

import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose?: () => void;
  duration?: number; // ms, 0 for no auto-close
  action?: {
    label: string;
    onClick: () => void;
  };
}

const typeConfig: Record<ToastType, { icon: typeof Check; className: string }> = {
  success: {
    icon: Check,
    className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  },
};

export function Toast({ message, type, onClose, duration = 3000, action }: ToastProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg ${config.className}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Hook for managing toast state
export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = React.useState<{ type: ToastType; message: string } | null>(null);

  const showToast = React.useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  const success = React.useCallback((message: string) => showToast('success', message), [showToast]);
  const error = React.useCallback((message: string) => showToast('error', message), [showToast]);
  const info = React.useCallback((message: string) => showToast('info', message), [showToast]);
  const warning = React.useCallback((message: string) => showToast('warning', message), [showToast]);

  const ToastComponent = toast ? (
    <Toast
      type={toast.type}
      message={toast.message}
      onClose={hideToast}
      duration={defaultDuration}
    />
  ) : null;

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    info,
    warning,
    ToastComponent,
  };
}

export default Toast;
