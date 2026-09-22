import { useRef } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../data/projects';
import { useIsTouchDevice, useReducedMotion } from '../../hooks/useMediaQuery';

const placeholderGradients = [
  'linear-gradient(135deg, #1c1a17 0%, #2b2118 45%, #4a2f16 100%)',
  'linear-gradient(135deg, #14181a 0%, #172426 45%, #123a3a 100%)',
  'linear-gradient(135deg, #17161a 0%, #211d2b 45%, #2c2140 100%)',
  'linear-gradient(135deg, #191715 0%, #241f18 45%, #3a2f1c 100%)',
  'linear-gradient(135deg, #121517 0%, #16201f 45%, #16332e 100%)',
];

interface ProjectCardProps {
  project: Project;
  index: number;
}

const MAX_TILT_DEG = 5;

/**
 * A plain card in normal document flow — no scroll pinning, no cross-fade
 * choreography. Just a clear preview, a light cursor-following tilt, and a
 * click-through to the project's detail page. The tilt is capped at a few
 * degrees and applied via direct style writes (no re-render per mousemove);
 * it's skipped entirely on touch devices and under reduced motion.
 */
export default function ProjectCard({ project, index }: ProjectCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();
  const tiltEnabled = !isTouch && !reducedMotion;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * MAX_TILT_DEG * 2;
    const rotateX = -py * MAX_TILT_DEG * 2;
    cardRef.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseEnter = () => {
    if (!tiltEnabled || !imageRef.current) return;
    imageRef.current.style.transform = 'scale(1.06)';
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
    if (tiltEnabled && imageRef.current) imageRef.current.style.transform = 'scale(1)';
  };

  return (
    <Box
      ref={cardRef}
      onClick={() => navigate(`/work/${project.slug}`)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        cursor: 'pointer',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.35s ease, border-color 0.25s ease',
        transformStyle: 'preserve-3d',
        willChange: tiltEnabled ? 'transform' : undefined,
        '&:hover': { borderColor: 'primary.main' },
        '&:hover .project-arrow-icon': { transform: 'translate(3px, -3px)' },
      }}
    >
      <Box sx={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
        <Box
          ref={imageRef}
          sx={{
            width: '100%',
            height: '100%',
            background: placeholderGradients[index % placeholderGradients.length],
            transition: 'transform 0.5s ease',
          }}
        />
      </Box>
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="overline" sx={{ color: 'primary.main' }}>
            {project.number}
          </Typography>
          <ArrowOutwardIcon
            className="project-arrow-icon"
            sx={{ fontSize: '1rem', color: 'text.secondary', transition: 'transform 0.3s ease' }}
          />
        </Stack>
        <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '1.3rem' }}>
          {project.name}
        </Typography>
        <Typography variant="body2">{project.description}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
          {project.technologies.slice(0, 3).map((tech) => (
            <Chip key={tech} label={tech} size="small" />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
