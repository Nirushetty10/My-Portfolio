import { ReactNode, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * A quick fade-in whenever the route changes — not a true overlapping
 * crossfade (that needs an "exit" animation library like Framer Motion's
 * AnimatePresence, which felt like more machinery than this site needs),
 * but enough to smooth over the hard cut between pages. Runs once per
 * navigation; skipped under reduced motion.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, reducedMotion]);

  return <div ref={ref}>{children}</div>;
}
