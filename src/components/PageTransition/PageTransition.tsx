import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * Wraps a single route's page content so AnimatePresence (in App.tsx) can
 * animate it in *and* out — a real transition between pages, not just a
 * fade-in on the new one. New page slides in from the right and fades in;
 * the outgoing page slides left and fades out underneath it, giving a
 * sense of moving forward through the site rather than a hard cut.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
