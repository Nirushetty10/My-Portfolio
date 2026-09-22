import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { useIsTouchDevice, useReducedMotion } from '../../hooks/useMediaQuery';

export type CursorState = 'default' | 'view' | 'explore';

/**
 * Desktop-only custom cursor. Listens for data-cursor="view" / "explore"
 * attributes on hovered elements to change label + size.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isTouch || reducedMotion) return;
    const dot = dotRef.current;
    if (!dot) return;

    const quickX = gsap.quickTo(dot, 'x', { duration: 0.5, ease: 'power3.out' });
    const quickY = gsap.quickTo(dot, 'y', { duration: 0.5, ease: 'power3.out' });

    const move = (e: MouseEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
    };

    const setState = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      const cursorTarget = el?.closest('[data-cursor]') as HTMLElement | null;
      const state = cursorTarget?.getAttribute('data-cursor') ?? 'default';
      dot.setAttribute('data-state', state);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', (e) => setState(e.target));

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, [isTouch, reducedMotion]);

  if (isTouch || reducedMotion) return null;

  return (
    <Box
      ref={dotRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 14,
        height: 14,
        marginLeft: '-7px',
        marginTop: '-7px',
        borderRadius: '50%',
        border: '1px solid rgba(237,234,228,0.6)',
        pointerEvents: 'none',
        zIndex: 3000,
        mixBlendMode: 'difference',
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.6rem',
        letterSpacing: '0.08em',
        color: '#EDEAE4',
        transition: 'width 0.3s ease, height 0.3s ease, margin 0.3s ease, background-color 0.3s ease',
        '&[data-state="view"]': {
          width: 64,
          height: 64,
          marginLeft: '-32px',
          marginTop: '-32px',
          backgroundColor: 'rgba(237,234,228,0.08)',
          '&::after': { content: '"VIEW"' },
        },
        '&[data-state="explore"]': {
          width: 72,
          height: 72,
          marginLeft: '-36px',
          marginTop: '-36px',
          backgroundColor: 'rgba(237,234,228,0.08)',
          '&::after': { content: '"EXPLORE"' },
        },
      }}
    />
  );
}
