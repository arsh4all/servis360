import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'outline';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  accent: 'bg-[#FACC15] text-[#0F172A] border-[#EAB308]',
  outline: 'bg-transparent text-[#0F172A] border-[#E2E8F0]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
};

export function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// Booking status badge
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    ACCEPTED: { label: 'Accepted', variant: 'info' },
    CONFIRMED: { label: 'Confirmed', variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
    DECLINED: { label: 'Declined', variant: 'danger' },
  };

  const config = map[status] || { label: status, variant: 'default' as BadgeProps['variant'] };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
