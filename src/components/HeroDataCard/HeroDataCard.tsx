import { useLayoutEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useMediaQuery';

interface HeroDataCardProps {
  label: string;
  value: string;
  sub?: string;
  delay?: number;
  floatOffset?: number;
  sx?: object;
}

/**
 * Small glass HUD panel used around the 3D core — reads like live telemetry
 * rather than a static badge. Bobs continuously and eases in on mount.
 */
export default function HeroDataCard({ label, value, sub, delay = 0, floatOffset = 10, sx }: HeroDataCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (reducedMotion) {
      gsap.set(ref.current, { opacity: 1, y: 0 });
      return;
    }
    const tl = gsap.timeline({ delay });
    tl.fromTo(ref.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
    gsap.to(ref.current, {
      y: `+=${floatOffset}`,
      duration: 3 + Math.random() * 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: delay + 0.9,
    });
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        px: 2,
        py: 1.5,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(19,19,21,0.55)',
        backdropFilter: 'blur(14px)',
        minWidth: 132,
        ...sx,
      }}
    >
      <Stack spacing={0.4}>
        <Typography sx={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 500,
            fontSize: '1.3rem',
            color: 'primary.main',
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{sub}</Typography>
        )}
      </Stack>
    </Box>
  );
}
