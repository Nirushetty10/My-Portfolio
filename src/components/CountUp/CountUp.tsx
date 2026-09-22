import { useEffect, useRef, useState } from 'react';
import { Typography, TypographyProps } from '@mui/material';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface CountUpProps extends Omit<TypographyProps, 'children'> {
  /** e.g. "3+", "15+", "99.9%", or a non-numeric string like "Multiple" */
  value: string;
  duration?: number;
}

/**
 * Renders `value` as static text until it scrolls into view, then — if it
 * starts with a number — counts up from 0 to that number once, keeping any
 * suffix (a "+", "%", etc.) fixed. Non-numeric values (e.g. "Multiple")
 * just render as-is; there's nothing to count. Runs once per mount, and is
 * skipped entirely under reduced motion.
 */
export default function CountUp({ value, duration = 1.2, ...typographyProps }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const hasRun = useRef(false);

  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const targetNumber = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;

  const [display, setDisplay] = useState(targetNumber === null ? value : `0${suffix}`);

  useEffect(() => {
    if (targetNumber === null || reducedMotion || !ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const counter = { n: 0 };
          gsap.to(counter, {
            n: targetNumber,
            duration,
            ease: 'power2.out',
            onUpdate: () => setDisplay(`${counter.n.toFixed(decimals)}${suffix}`),
          });
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetNumber, suffix, decimals, duration, reducedMotion]);

  return (
    <Typography ref={ref} {...typographyProps}>
      {reducedMotion || targetNumber === null ? value : display}
    </Typography>
  );
}
