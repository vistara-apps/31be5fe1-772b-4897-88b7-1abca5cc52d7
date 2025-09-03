'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function LoadingSpinner({ className, size = 'default' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white/30 border-t-white',
        sizeClasses[size],
        className
      )}
    />
  );
}
