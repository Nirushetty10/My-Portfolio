import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

/**
 * A 2px bar fixed to the top of the viewport that fills left-to-right as
 * the person scrolls down the page. Updated by writing directly to the
 * bar's own style on scroll (rAF-throttled) rather than through React
 * state, so it never triggers a re-render of anything else.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        zIndex: 1300,
        backgroundColor: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <Box
        ref={barRef}
        sx={{
          height: '100%',
          width: '100%',
          transformOrigin: 'left',
          transform: 'scaleX(0)',
          backgroundColor: 'primary.main',
        }}
      />
    </Box>
  );
}
