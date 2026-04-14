import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-4 border-[#E2E8F0] border-t-[#0F172A] animate-spin',
          sizes[size]
        )}
      />
      {label && <p className="text-sm text-[#64748B]">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r from-[#F1F5F9] via-[#E2E8F0] to-[#F1F5F9]',
        'animate-shimmer bg-[length:200%_100%]',
        className
      )}
    />
  );
}
