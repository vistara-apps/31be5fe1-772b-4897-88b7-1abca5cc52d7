'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card', className)}
    {...props}
  />
));

Card.displayName = 'Card';

export { Card };
