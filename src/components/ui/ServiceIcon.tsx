import {
  Sparkles,
  Zap,
  Droplets,
  Camera,
  Baby,
  Heart,
  Wrench,
  Home,
  Shield,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Zap,
  Droplets,
  Camera,
  Baby,
  Heart,
  Wrench,
  Home,
  Shield,
  Star,
};

interface ServiceIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  containerClassName?: string;
}

const sizes = {
  sm: { container: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  md: { container: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
  lg: { container: 'w-18 h-18 rounded-2xl', icon: 'w-9 h-9' },
  xl: { container: 'w-24 h-24 rounded-3xl', icon: 'w-12 h-12' },
};

export function ServiceIcon({ icon, size = 'md', className, containerClassName }: ServiceIconProps) {
  const IconComponent = ICON_MAP[icon] || Home;
  const { container, icon: iconSize } = sizes[size];

  return (
    <div
      className={cn(
        'bg-[#0F172A] flex items-center justify-center shrink-0',
        container,
        containerClassName
      )}
    >
      <IconComponent className={cn('text-[#FACC15]', iconSize, className)} />
    </div>
  );
}
