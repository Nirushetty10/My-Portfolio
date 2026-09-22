import { Box, Container, Stack, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import MagneticButton from '../../components/MagneticButton/MagneticButton';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';

// NEEDS_CONFIRMATION: Replace with real GitHub / LinkedIn / email links.
const socials = [
  { label: 'GitHub', href: 'https://github.com/', icon: <GitHubIcon fontSize="small" /> },
  { label: 'LinkedIn', href: 'https://linkedin.com/', icon: <LinkedInIcon fontSize="small" /> },
  { label: 'Email', href: 'mailto:hello@example.com', icon: <EmailIcon fontSize="small" /> },
];

export default function Contact() {
  return (
    <Box
      id="contact"
      component="section"
      sx={{
        py: { xs: 12, md: 16 },
        background: 'radial-gradient(ellipse at 70% 40%, rgba(79,70,229,0.05), transparent 55%)',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <ScrollReveal>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            Have a project in mind?
          </Typography>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)',
              color: 'text.secondary',
              mt: 1.5,
            }}
          >
            Let's build something great.
          </Typography>
        </ScrollReveal>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ sm: 'center' }} sx={{ mt: 5 }}>
          <MagneticButton>
            <Box
              component="a"
              href="mailto:hello@example.com"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'text.primary',
                fontSize: '1.05rem',
                fontWeight: 500,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 0.5,
                transition: 'border-color 0.3s ease, color 0.3s ease',
                '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                '& .MuiSvgIcon-root': { transition: 'transform 0.3s ease' },
                '&:hover .MuiSvgIcon-root': { transform: 'translate(3px, -3px)' },
              }}
            >
              Start a conversation <ArrowOutwardIcon fontSize="small" />
            </Box>
          </MagneticButton>

          <Stack direction="row" spacing={3}>
            {socials.map((s) => (
              <Box
                key={s.label}
                component="a"
                href={s.href}
                target="_blank"
                rel="noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'color 0.3s ease',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {s.icon}
                {s.label}
              </Box>
            ))}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: { xs: 8, md: 10 } }}>
          <Typography variant="body2">© 2026 Niranjan KS</Typography>
          <Typography variant="body2">Bangalore, India</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
