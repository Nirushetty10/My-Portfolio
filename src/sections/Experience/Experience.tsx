import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { experience } from '../../data/experience';

export default function Experience() {
  return (
    <Box id="experience" component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <SectionHeading label="Journey" title="Experience" />
        </Box>

        <Stack spacing={0}>
          {experience.map((item, i) => (
            <ScrollReveal key={item.year} delay={i * 0.05} y={22}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 4 }}
                sx={{
                  py: 3.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 500,
                    fontSize: '1.3rem',
                    color: 'primary.main',
                    width: { sm: 100 },
                    flexShrink: 0,
                  }}
                >
                  {item.year}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontSize: '1.15rem', mb: 0.75 }}>
                    {item.role}
                  </Typography>
                  <Typography variant="body2" sx={{ maxWidth: 520, mb: 1.5 }}>
                    {item.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {item.technologies.map((t) => (
                      <Chip key={t} label={t} size="small" />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </ScrollReveal>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
