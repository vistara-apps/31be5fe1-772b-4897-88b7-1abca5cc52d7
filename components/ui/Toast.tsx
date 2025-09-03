'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  variant: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 glass p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-up',
        variant === 'success' ? 'border-green-500/30' : 'border-red-500/30'
      )}
    >
      {variant === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
      <span className="text-white">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
