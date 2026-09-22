import { useRef, ReactNode } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { useIsTouchDevice, useReducedMotion } from '../../hooks/useMediaQuery';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
}

/**
 * Wraps any element (typically a Button) with a magnetic hover effect:
 * the element follows the cursor slightly within its bounds, then
 * eases back to rest on mouse leave.
 */
export default function MagneticButton({ children, strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.5,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <Box
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </Box>
  );
}
