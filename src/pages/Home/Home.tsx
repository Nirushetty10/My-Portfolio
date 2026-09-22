import { Box } from '@mui/material';
import Hero from '../../sections/Hero/Hero';
import SelectedWork from '../../sections/SelectedWork/SelectedWork';
import About from '../../sections/About/About';
import TechStack from '../../sections/TechStack/TechStack';
import Experience from '../../sections/Experience/Experience';
import Services from '../../sections/Services/Services';
import Contact from '../../sections/Contact/Contact';

export default function Home() {
  return (
    <Box>
      <Hero />
      <SelectedWork />
      <About />
      <TechStack />
      <Experience />
      <Services />
      <Contact />
    </Box>
  );
}
