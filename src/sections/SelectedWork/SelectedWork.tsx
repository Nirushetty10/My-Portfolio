import { Box, Container, Grid } from '@mui/material';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { projects } from '../../data/projects';

export default function SelectedWork() {
  return (
    <Box id="work" component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1400, px: { xs: 3, md: 6 } }}>
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <SectionHeading label="Featured Projects" title="Selected Work" />
        </Box>

        <Grid container spacing={4}>
          {projects.map((project, i) => (
            <Grid item xs={12} sm={6} key={project.id}>
              <ScrollReveal delay={(i % 2) * 0.08}>
                <ProjectCard project={project} index={i} />
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
