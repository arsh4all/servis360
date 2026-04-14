'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTilt, type TiltOptions } from '@/hooks/useTilt';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tiltOptions?: TiltOptions;
  gloss?: boolean;
  children: React.ReactNode;
  innerClassName?: string;
}

/**
 * TiltCard — drop-in wrapper that adds the interactive 3D tilt effect.
 *
 * Usage:
 *   <TiltCard className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
 *     …card content…
 *   </TiltCard>
 */
export function TiltCard({
  children,
  className,
  innerClassName,
  tiltOptions,
  gloss = true,
  ...props
}: TiltCardProps) {
  const { ref, cardStyle, glossStyle, innerStyle } = useTilt({
    maxTilt: 8,
    scale: 1.03,
    perspective: 1000,
    gloss,
    ...tiltOptions,
  });

  return (
    <div
      ref={ref}
      style={cardStyle}
      className={cn(
        // Base card styles — rounded, white, bordered
        'relative bg-white rounded-2xl border border-[#E2E8F0]',
        // Ensure 3D children are clipped cleanly
        'overflow-hidden',
        // Cursor
        'cursor-default',
        className
      )}
      {...props}
    >
      {/* Gloss overlay — sits above content, pointer-events: none */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 rounded-2xl pointer-events-none select-none"
        style={glossStyle}
      />

      {/* Inner content — very slightly parallaxed */}
      <div className={cn('relative z-0', innerClassName)} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
