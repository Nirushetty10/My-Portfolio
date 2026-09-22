import { useLayoutEffect, useRef, ReactNode } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

interface MaskRevealProps {
  lines: ReactNode[];
  variant?: 'immediate' | 'scroll';
  delay?: number;
  stagger?: number;
  sx?: object;
}

/**
 * Renders each line inside an overflow-hidden band and animates it up from
 * behind that mask — a "curtain rising" reveal rather than a plain fade,
 * used for headline moments across the site.
 */
export default function MaskReveal({ lines, variant = 'scroll', delay = 0, stagger = 0.1, sx }: MaskRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) {
      gsap.set(lineRefs.current, { y: 0, opacity: 1 });
      return;
    }
    const targets = lineRefs.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: '105%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger,
          delay: variant === 'immediate' ? delay : 0,
          scrollTrigger:
            variant === 'scroll'
              ? { trigger: rootRef.current, start: 'top 82%' }
              : undefined,
        }
      );
    }, rootRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <Box ref={rootRef} sx={sx}>
      {lines.map((line, i) => (
        <Box key={i} sx={{ overflow: 'hidden' }}>
          <Box
            ref={(el: HTMLDivElement | null) => (lineRefs.current[i] = el)}
            sx={{ display: 'block', willChange: 'transform' }}
          >
            {line}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
