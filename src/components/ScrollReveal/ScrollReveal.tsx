import { useLayoutEffect, useRef, ReactNode } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  start?: string;
}

/**
 * Fades + lifts a block into view once as it crosses the given scroll
 * trigger point. Used sparingly — for content blocks, not every element.
 */
export default function ScrollReveal({
  children,
  y = 32,
  delay = 0,
  duration = 1,
  start = 'top 85%',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [y, delay, duration, start, reducedMotion]);

  return <Box ref={ref}>{children}</Box>;
}
