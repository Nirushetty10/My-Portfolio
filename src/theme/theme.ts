import { createTheme, alpha } from '@mui/material/styles';

/**
 * Design tokens — "Light Product" theme
 * -----------------------------------------------------------------------
 * Background   #FAFAF8  warm off-white
 * Surface      #FFFFFF  raised white (cards, panels)
 * Ink          #111113  primary text (near-black, not pure black)
 * Muted        #6B6A68  secondary text
 * Accent       #4F46E5  single accent (indigo) — used for links, CTAs,
 *              active states; deliberately the only saturated color
 *              on the page
 * Hairline     rgba(17,17,19,0.10)
 */

export const colors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  ink: '#111113',
  muted: '#6B6A68',
  mutedDim: '#9C9A97',
  accent: '#4F46E5',
  accentDim: '#3D34C9',
  hairline: 'rgba(17,17,19,0.10)',
  hairlineStrong: 'rgba(17,17,19,0.18)',
};

declare module '@mui/material/styles' {
  interface TypeBackground {
    surface: string;
    surfaceRaised: string;
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: colors.background,
      paper: colors.surface,
      surface: colors.surface,
      surfaceRaised: colors.surfaceRaised,
    },
    primary: {
      main: colors.accent,
      dark: colors.accentDim,
      contrastText: '#FFFFFF',
    },
    text: {
      primary: colors.ink,
      secondary: colors.muted,
    },
    divider: colors.hairline,
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 500,
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 500,
      lineHeight: 1.02,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 500,
      lineHeight: 1.08,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 500,
      lineHeight: 1.15,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.001em',
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.55,
      color: colors.muted,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    overline: {
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontSize: '0.72rem',
      color: colors.muted,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': {
          backgroundColor: alpha(colors.accent, 0.18),
          color: colors.ink,
        },
        html: {
          backgroundColor: colors.background,
          scrollBehavior: 'auto',
        },
        body: {
          backgroundColor: colors.background,
          color: colors.ink,
          overflowX: 'hidden',
        },
        '::-webkit-scrollbar': {
          width: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: colors.background,
        },
        '::-webkit-scrollbar-thumb': {
          background: colors.hairlineStrong,
          borderRadius: '4px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '12px 28px',
          border: `1px solid ${colors.hairlineStrong}`,
          backgroundColor: 'transparent',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, background-color 0.3s ease',
          '& .MuiButton-endIcon': {
            transition: 'transform 0.3s ease',
          },
          '&:hover .MuiButton-endIcon': {
            transform: 'translateX(3px)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            backgroundColor: colors.accent,
            color: '#FFFFFF',
            border: `1px solid ${colors.accent}`,
            '&:hover': {
              backgroundColor: colors.accentDim,
              borderColor: colors.accentDim,
              boxShadow: `0 8px 24px ${alpha(colors.accent, 0.28)}`,
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            color: colors.ink,
            borderColor: colors.hairlineStrong,
            '&:hover': {
              borderColor: colors.accent,
              color: colors.accent,
              backgroundColor: alpha(colors.accent, 0.05),
            },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: `1px solid ${colors.hairline}`,
          backgroundColor: 'transparent',
          color: colors.muted,
          fontWeight: 500,
          fontSize: '0.78rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.hairline,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background,
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
