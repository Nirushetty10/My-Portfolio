import { Box } from '@mui/material';
import { useReducedMotion } from '../../hooks/useMediaQuery';

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
  <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>
  <rect width='100%25' height='100%25' filter='url(%23n)'/>
</svg>`;

/**
 * A fixed, full-viewport film-grain texture + soft vignette, sitting above
 * all content. Pure decoration — pointer-events disabled — gives the whole
 * site a cinematic, slightly analog quality rather than a flat digital one.
 */
export default function FilmGrain() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2500,
          pointerEvents: 'none',
          opacity: 0.05,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,${GRAIN_SVG}")`,
          backgroundSize: '120px 120px',
          animation: reducedMotion ? 'none' : 'grainShift 0.6s steps(4) infinite',
          '@keyframes grainShift': {
            '0%': { transform: 'translate(0, 0)' },
            '25%': { transform: 'translate(-2%, 1%)' },
            '50%': { transform: 'translate(1%, -2%)' },
            '75%': { transform: 'translate(-1%, -1%)' },
            '100%': { transform: 'translate(0, 0)' },
          },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2400,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, rgba(10,10,11,0) 45%, rgba(10,10,11,0.55) 100%)',
        }}
      />
    </>
  );
}
