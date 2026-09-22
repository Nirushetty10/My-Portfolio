import { Suspense, lazy, useLayoutEffect, useRef } from 'react';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import gsap from 'gsap';
import MagneticButton from '../../components/MagneticButton/MagneticButton';
import { useReducedMotion } from '../../hooks/useMediaQuery';

const SkillsModel = lazy(() => import('../../components/SkillsModel/SkillsModel'));

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) {
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );
  }, [reducedMotion]);

  return (
    <Box
      id="hero"
      component="section"
      sx={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 14, md: 10 },
        pb: 6,
        background: 'radial-gradient(ellipse at 75% 30%, rgba(79,70,229,0.06), transparent 55%)',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box ref={contentRef}>
              <Typography variant="overline" sx={{ display: 'block', mb: 2 }}>
                React Developer · Frontend Engineer
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                  mb: 3,
                }}
              >
                I build digital experiences.
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, fontSize: '1.05rem', mb: 4 }}>
                I design and build fast, reliable web applications — from real-time
                collaborative tools to data-heavy dashboards — using the MERN stack.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <MagneticButton>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowOutwardIcon />}
                    onClick={() => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View my work
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Contact me
                  </Button>
                </MagneticButton>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Suspense fallback={<Box sx={{ width: '100%', height: { xs: 260, md: 380 } }} />}>
              <SkillsModel height={{ xs: 260, md: 380 }} />
            </Suspense>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
