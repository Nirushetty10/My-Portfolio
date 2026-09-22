import { Box, Container } from '@mui/material';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import Marquee from '../../components/Marquee/Marquee';

export default function TechStack() {
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <SectionHeading label="Tools & Technology" title="What I work with" />
        </Box>
        <Marquee />
      </Container>
    </Box>
  );
}
