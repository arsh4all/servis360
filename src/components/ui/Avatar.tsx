import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'w-6 h-6 text-xs', image: 24 },
  sm: { container: 'w-8 h-8 text-xs', image: 32 },
  md: { container: 'w-10 h-10 text-sm', image: 40 },
  lg: { container: 'w-14 h-14 text-base', image: 56 },
  xl: { container: 'w-20 h-20 text-xl', image: 80 },
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const { container, image } = sizes[size];

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden shrink-0', container, className)}>
        <Image
          src={src}
          alt={name}
          width={image}
          height={image}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-[#0F172A] text-[#FACC15] flex items-center justify-center font-bold shrink-0',
        container,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
