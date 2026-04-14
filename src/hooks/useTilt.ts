'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

export interface TiltState {
  rotateX: number;
  rotateY: number;
  glossX: number; // 0–100 percent
  glossY: number; // 0–100 percent
  isHovered: boolean;
}

export interface TiltOptions {
  maxTilt?: number;       // degrees, default 8
  scale?: number;         // default 1.03
  perspective?: number;   // px, default 1000
  speed?: number;         // transition ms, default 300
  gloss?: boolean;        // light reflection, default true
  disabled?: boolean;     // kill on touch devices etc.
}

const DEFAULT_STATE: TiltState = {
  rotateX: 0,
  rotateY: 0,
  glossX: 50,
  glossY: 50,
  isHovered: false,
};

export function useTilt(options: TiltOptions = {}) {
  const {
    maxTilt = 8,
    scale = 1.03,
    perspective = 1000,
    speed = 300,
    gloss = true,
    disabled = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [tilt, setTilt] = useState<TiltState>(DEFAULT_STATE);

  // Lerp target — we'll interpolate toward this each frame
  const target = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const current = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const hovered = useRef(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const LERP_FACTOR = 0.12; // smoothness — lower = smoother/slower

  const animate = useCallback(() => {
    const c = current.current;
    const t = target.current;

    c.rx = lerp(c.rx, t.rx, LERP_FACTOR);
    c.ry = lerp(c.ry, t.ry, LERP_FACTOR);
    c.gx = lerp(c.gx, t.gx, LERP_FACTOR);
    c.gy = lerp(c.gy, t.gy, LERP_FACTOR);

    setTilt({
      rotateX: c.rx,
      rotateY: c.ry,
      glossX: c.gx,
      glossY: c.gy,
      isHovered: hovered.current,
    });

    // Keep animating while hovered, or while still returning to 0
    const stillMoving =
      Math.abs(c.rx) > 0.01 ||
      Math.abs(c.ry) > 0.01 ||
      Math.abs(c.gx - 50) > 0.1 ||
      Math.abs(c.gy - 50) > 0.1;

    if (hovered.current || stillMoving) {
      rafId.current = requestAnimationFrame(animate);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Normalised position: -1 … +1 relative to card center
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      target.current = {
        rx: -ny * maxTilt, // rotateX flipped so top edge lifts toward cursor
        ry: nx * maxTilt,
        gx: ((e.clientX - rect.left) / rect.width) * 100,
        gy: ((e.clientY - rect.top) / rect.height) * 100,
      };
    },
    [maxTilt]
  );

  const handleMouseEnter = useCallback(() => {
    hovered.current = true;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleMouseLeave = useCallback(() => {
    hovered.current = false;
    // Return to flat
    target.current = { rx: 0, ry: 0, gx: 50, gy: 50 };
    // Keep rAF running until we're flat again
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    if (disabled) return;

    // Disable on touch/coarse-pointer devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [disabled, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Build the inline style for the card wrapper
  const cardStyle: React.CSSProperties = {
    transform: `
      perspective(${perspective}px)
      rotateX(${tilt.rotateX}deg)
      rotateY(${tilt.rotateY}deg)
      scale3d(${tilt.isHovered ? scale : 1}, ${tilt.isHovered ? scale : 1}, 1)
    `,
    willChange: 'transform',
    transition: tilt.isHovered
      ? 'box-shadow 300ms ease-out'        // smooth shadow while hovering
      : `transform 500ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 500ms ease-out`, // smooth return
    boxShadow: tilt.isHovered
      ? `
          ${tilt.rotateY * 1.5}px ${-tilt.rotateX * 1.5}px 40px rgba(15,23,42,0.18),
          0 8px 32px rgba(15,23,42,0.12)
        `
      : '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)',
  };

  // Gloss overlay style — radial gradient that follows cursor
  const glossStyle: React.CSSProperties = gloss
    ? {
        background: `radial-gradient(circle at ${tilt.glossX}% ${tilt.glossY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, transparent 70%)`,
        opacity: tilt.isHovered ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }
    : { display: 'none' };

  // Subtle parallax for inner content — shifts opposite to tilt
  const innerStyle: React.CSSProperties = {
    transform: `translateX(${tilt.rotateY * -0.5}px) translateY(${tilt.rotateX * 0.5}px)`,
    transition: tilt.isHovered ? 'none' : 'transform 500ms cubic-bezier(0.23, 1, 0.32, 1)',
  };

  return { ref, cardStyle, glossStyle, innerStyle, tilt };
}
