import { Box, Typography, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface SectionHeadingProps {
  label?: string;
  title: ReactNode;
  align?: 'left' | 'center';
  maxWidth?: number | string;
}

export default function SectionHeading({ label, title, align = 'left', maxWidth }: SectionHeadingProps) {
  return (
    <Stack
      spacing={2.5}
      sx={{
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        maxWidth: maxWidth ?? '100%',
      }}
    >
      {label && (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 28, height: '1px', bgcolor: 'divider' }} />
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
        </Stack>
      )}
      <Typography
        variant="h2"
        sx={{
          fontSize: 'clamp(1.8rem, 3.2vw, 2.75rem)',
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
}
