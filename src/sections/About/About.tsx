import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import CountUp from '../../components/CountUp/CountUp';

const stats = [
  { value: '3+', label: 'Years experience' },
  { value: '15+', label: 'Features shipped' },
  { value: 'Multiple', label: 'Production applications' },
];

export default function About() {
  return (
    <Box id="about" component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Grid container spacing={{ xs: 5, md: 6 }}>
          <Grid item xs={12} md={7}>
            <ScrollReveal>
              <Typography
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.75rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
              >
                I turn complex problems into simple interfaces.
              </Typography>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Typography variant="body1" sx={{ mt: 3, maxWidth: 480, color: 'text.secondary' }}>
                I'm a React developer focused on building modern, scalable and
                high-performance web applications — from real-time
                collaborative editors to data-heavy dashboards.
              </Typography>
            </ScrollReveal>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={4} sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider', pl: { md: 5 } }}>
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} delay={i * 0.06}>
                  <Box>
                    <CountUp
                      value={stat.value}
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 500,
                        fontSize: '2rem',
                        color: 'primary.main',
                        lineHeight: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </ScrollReveal>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
