import { Box, Container, Stack, Typography } from '@mui/material';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';

const services = [
  'Frontend development',
  'React applications',
  'SaaS development',
  'AI product development',
  'Dashboard development',
  'UI engineering',
  'Real-time web applications',
];

export default function Services() {
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <SectionHeading label="What I build" title="Services" />
        </Box>

        <Stack>
          {services.map((service, i) => (
            <ScrollReveal key={service} delay={i * 0.04} y={22}>
              <Box
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: { xs: 1.75, md: 2.25 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(1.15rem, 2vw, 1.5rem)',
                    color: 'text.primary',
                  }}
                >
                  {service}
                </Typography>
              </Box>
            </ScrollReveal>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
