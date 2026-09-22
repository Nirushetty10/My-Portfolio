import { Box, Stack, Typography } from '@mui/material';
import { technologies } from '../../data/technologies';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * A genuine auto-scrolling marquee — the technology list scrolls
 * continuously and seamlessly (the content is duplicated once, and the
 * strip translates by exactly one copy's width before looping). Pauses on
 * hover so a name can actually be read, and stops entirely (rendering a
 * plain static row) under reduced motion.
 */
export default function Marquee() {
  const reducedMotion = useReducedMotion();

  const track = (
    <Stack direction="row" alignItems="center" spacing={5} sx={{ pr: 5 }}>
      {technologies.map((tech) => (
        <Stack key={tech.name} direction="row" alignItems="center" spacing={5}>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              fontSize: { xs: '1.3rem', md: '1.9rem' },
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            {tech.name}
          </Typography>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'divider', flexShrink: 0 }} />
        </Stack>
      ))}
    </Stack>
  );

  if (reducedMotion) {
    return (
      <Box sx={{ overflowX: 'auto', width: '100%', py: 1 }}>
        {track}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflow: 'hidden',
        width: '100%',
        py: 1,
        maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: 'max-content',
          animation: 'marqueeScroll 32s linear infinite',
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes marqueeScroll': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        }}
      >
        {track}
        {track}
      </Box>
    </Box>
  );
}
