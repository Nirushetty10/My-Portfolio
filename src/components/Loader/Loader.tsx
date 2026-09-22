import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const counterObj = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(rootRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.9,
          ease: 'power4.inOut',
          onComplete,
        });
      },
    });

    tl.to(counterObj, {
      value: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => setCount(Math.round(counterObj.value)),
    });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      ref={rootRef}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: 'inset(0 0 0% 0)',
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: { xs: '1.6rem', md: '2.2rem' },
          letterSpacing: '0.02em',
        }}
      >
        NIRANJAN KS
      </Typography>
      <Typography variant="overline" sx={{ mt: 1, mb: 4 }}>
        REACT DEVELOPER
      </Typography>
      <Box ref={counterRef} sx={{ position: 'relative' }}>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: { xs: '3rem', md: '5rem' },
            fontWeight: 500,
            color: 'primary.main',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(count).padStart(2, '0')}
        </Typography>
      </Box>
    </Box>
  );
}
