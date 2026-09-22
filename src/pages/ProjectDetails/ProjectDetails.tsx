import { useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import gsap from 'gsap';
import { getProjectBySlug, projects } from '../../data/projects';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { useReducedMotion } from '../../hooks/useMediaQuery';

type ProjectDetail = NonNullable<ReturnType<typeof getProjectBySlug>>['detail'];

const detailBlocks: { key: keyof ProjectDetail; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'myRole', label: 'My Role' },
  { key: 'technology', label: 'Technology' },
  { key: 'keyFeatures', label: 'Key Features' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'result', label: 'Result' },
];

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const project = slug ? getProjectBySlug(slug) : undefined;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (reducedMotion || !heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    );
  }, [reducedMotion, slug]);

  if (!project) {
    return (
      <Container sx={{ py: 20, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Box
          component="button"
          onClick={() => navigate('/')}
          sx={{ background: 'none', border: 'none', color: 'primary.main', cursor: 'pointer', fontSize: '1rem' }}
        >
          ← Back home
        </Box>
      </Container>
    );
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <Box sx={{ pt: { xs: 14, md: 16 }, pb: 10 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.85rem',
            mb: { xs: 6, md: 10 },
            transition: 'color 0.3s ease',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <ArrowBackIcon fontSize="small" /> Back to work
        </Box>

        <Box ref={heroRef}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontSize: '0.85rem' }}>
            Project {project.number}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              lineHeight: 0.98,
              mt: 1.5,
              mb: 2,
            }}
          >
            {project.name}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 640, color: 'text.secondary', fontSize: '1.1rem', mb: 3 }}>
            {project.detail.tagline}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {project.technologies.map((t) => (
              <Chip key={t} label={t} size="small" />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            mt: { xs: 6, md: 10 },
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            aspectRatio: { xs: '4 / 5', md: '21 / 9' },
            background: 'linear-gradient(135deg, #17161a 0%, #211d2b 45%, #2c2140 100%)',
          }}
        />

        <Grid container spacing={{ xs: 6, md: 4 }} sx={{ mt: { xs: 4, md: 8 } }}>
          {detailBlocks.map((block, i) => {
            const value = project.detail[block.key];
            return (
              <Grid item xs={12} md={4} key={String(block.key)}>
                <ScrollReveal delay={(i % 3) * 0.06}>
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
                    <Typography variant="overline" sx={{ mb: 1.5, display: 'block' }}>
                      {block.label}
                    </Typography>
                    {Array.isArray(value) ? (
                      <Stack spacing={1}>
                        {value.map((feature) => (
                          <Typography key={feature} variant="body1" sx={{ color: 'text.secondary' }}>
                            — {feature}
                          </Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {value}
                      </Typography>
                    )}
                  </Box>
                </ScrollReveal>
              </Grid>
            );
          })}
        </Grid>

        <Box
          sx={{
            mt: { xs: 10, md: 16 },
            pt: { xs: 6, md: 8 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="overline" sx={{ display: 'block', mb: 2 }}>
            Next project
          </Typography>
          <Box
            component={RouterLink}
            to={`/work/${next.slug}`}
            sx={{
              display: 'block',
              textDecoration: 'none',
              color: 'text.primary',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)',
              transition: 'color 0.3s ease',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {next.name} →
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
