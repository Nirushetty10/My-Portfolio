import { useEffect, useRef, useState } from 'react';
import { Box, Container, Drawer, IconButton, Stack, Typography, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { colors } from '../../theme/theme';

const NAV_ITEMS = [
  { label: 'WORK', href: '#work' },
  { label: 'ABOUT', href: '#about' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'CONTACT', href: '#contact' },
];

export default function Navbar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      backgroundColor: scrolled ? alpha(colors.background, 0.72) : alpha(colors.background, 0),
      backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
      borderBottomColor: scrolled ? colors.hairline : 'transparent',
      paddingTop: scrolled ? 14 : 26,
      paddingBottom: scrolled ? 14 : 26,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [scrolled]);

  const goToSection = (href: string) => {
    setDrawerOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for home to mount before scrolling.
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      });
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Box
        ref={barRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderBottom: '1px solid transparent',
          pt: '26px',
          pb: '26px',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              onClick={() => navigate('/')}
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 500,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              NIRANJAN KS
            </Typography>

            <Stack
              direction="row"
              spacing={5}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {NAV_ITEMS.map((item) => (
                <Typography
                  key={item.label}
                  onClick={() => goToSection(item.href)}
                  sx={{
                    position: 'relative',
                    fontSize: '0.82rem',
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: 'text.primary' },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      bottom: -4,
                      width: '100%',
                      height: '1px',
                      backgroundColor: 'currentColor',
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 8px rgba(79,70,229,0.5)' }} />
              <Typography sx={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: 'text.secondary' }}>
                AVAILABLE FOR WORK
              </Typography>
            </Stack>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: '100vw', maxWidth: 420, height: '100%', p: 4, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="flex-end">
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.primary' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack spacing={3} sx={{ mt: 6, flex: 1 }}>
            {NAV_ITEMS.map((item, i) => (
              <Typography
                key={item.label}
                onClick={() => goToSection(item.href)}
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '2.4rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  opacity: 0,
                  animation: `fadeUp 0.6s ease ${0.08 * i}s forwards`,
                  '@keyframes fadeUp': {
                    from: { opacity: 0, transform: 'translateY(16px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
          <Typography variant="body2">AVAILABLE FOR WORK</Typography>
        </Box>
      </Drawer>
    </>
  );
}
