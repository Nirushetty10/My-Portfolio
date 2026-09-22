import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../../data/projects';
import { useIsDesktop, useReducedMotion } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

const placeholderGradients = [
  'linear-gradient(135deg, #1c1a17 0%, #2b2118 45%, #4a2f16 100%)',
  'linear-gradient(135deg, #14181a 0%, #172426 45%, #123a3a 100%)',
  'linear-gradient(135deg, #17161a 0%, #211d2b 45%, #2c2140 100%)',
  'linear-gradient(135deg, #191715 0%, #241f18 45%, #3a2f1c 100%)',
  'linear-gradient(135deg, #121517 0%, #16201f 45%, #16332e 100%)',
];

/**
 * Pins the section for one viewport-height per project, then scrubs a
 * cross-fade + scale between inset panels as the person scrolls — a "film
 * reel" rather than a stack of cards. Panels are deliberately inset (not
 * edge-to-edge) so the persistent 3D head, rendered globally behind all
 * page content, stays visible in the margins throughout this section too.
 * Falls back to a plain vertical stack on touch/mobile and when reduced
 * motion is requested, since pinned scrubbing reads poorly there.
 */
export default function CinematicReel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const usePinnedReel = isDesktop && !reducedMotion;

  useLayoutEffect(() => {
    if (!usePinnedReel || !sectionRef.current) return;

    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const images = imageRefs.current.filter(Boolean) as HTMLDivElement[];
    const count = projects.length;

    gsap.set(panels, { opacity: 0, pointerEvents: 'none' });
    gsap.set(panels[0], { opacity: 1, pointerEvents: 'auto' });
    gsap.set(images, { scale: 1.14 });
    gsap.set(images[0], { scale: 1 });

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${(count - 1) * 100}%`,
        pin: true,
        scrub: 0.7,
        onUpdate: (self) => {
          const raw = self.progress * (count - 1);
          const idx = Math.min(count - 2, Math.floor(raw));
          const t = raw - idx;

          panels.forEach((panel, i) => {
            if (i === idx) {
              gsap.set(panel, { opacity: 1 - t, pointerEvents: t < 0.5 ? 'auto' : 'none' });
            } else if (i === idx + 1) {
              gsap.set(panel, { opacity: t, pointerEvents: t >= 0.5 ? 'auto' : 'none' });
            } else {
              gsap.set(panel, { opacity: 0, pointerEvents: 'none' });
            }
          });

          images.forEach((img, i) => {
            if (i === idx) {
              gsap.set(img, { scale: 1 + t * 0.14 });
            } else if (i === idx + 1) {
              gsap.set(img, { scale: 1.14 - t * 0.14 });
            }
          });

          setActiveIndex(Math.round(idx + t));
        },
      });

      return () => st.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, [usePinnedReel]);

  if (!usePinnedReel) {
    // Static / mobile fallback: simple stacked full-bleed panels.
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {projects.map((project, i) => (
          <Box
            key={project.id}
            onClick={() => navigate(`/work/${project.slug}`)}
            sx={{
              position: 'relative',
              mx: { xs: 3, sm: 0 },
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              aspectRatio: '4 / 5',
              cursor: 'pointer',
              background: placeholderGradients[i % placeholderGradients.length],
            }}
          >
            <PanelContent project={project} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box ref={sectionRef} sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {projects.map((project, i) => (
        <Box
          key={project.id}
          ref={(el: HTMLDivElement | null) => (panelRefs.current[i] = el)}
          onClick={() => navigate(`/work/${project.slug}`)}
          data-cursor="view"
          sx={{
            position: 'absolute',
            inset: { xs: '3% 4%', md: '5% 6%' },
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            willChange: 'opacity',
          }}
        >
          <Box
            ref={(el: HTMLDivElement | null) => (imageRefs.current[i] = el)}
            sx={{
              position: 'absolute',
              inset: 0,
              background: placeholderGradients[i % placeholderGradients.length],
              willChange: 'transform',
            }}
          />
          <PanelContent project={project} />
        </Box>
      ))}

      {/* Reel index + scrub progress, echoing the hero's 01/05 indicator */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        sx={{ position: 'absolute', left: 0, right: 0, bottom: 40, px: { xs: 3, md: 6 }, zIndex: 2 }}
      >
        <Typography variant="overline">Scroll to explore</Typography>
        <Typography variant="overline">
          {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </Typography>
      </Stack>
      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '2px', bgcolor: 'divider', zIndex: 2 }}>
        <Box
          sx={{
            height: '100%',
            width: `${((activeIndex + 1) / projects.length) * 100}%`,
            bgcolor: 'primary.main',
            transition: 'width 0.2s linear',
          }}
        />
      </Box>
    </Box>
  );
}

function PanelContent({ project }: { project: (typeof projects)[number] }) {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10,10,11,0.15) 0%, rgba(10,10,11,0.15) 40%, rgba(10,10,11,0.9) 100%)',
        }}
      />
      <Stack
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 3, md: 6 },
          pb: { xs: 12, md: 16 },
          zIndex: 1,
        }}
        spacing={2}
      >
        <Typography variant="overline" sx={{ color: 'primary.main', fontSize: '0.85rem' }}>
          {project.number}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
            lineHeight: 0.98,
          }}
        >
          {project.name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
          {project.description}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
          {project.technologies.map((tech) => (
            <Chip key={tech} label={tech} size="small" />
          ))}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 1.5, color: 'text.primary' }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>VIEW PROJECT</Typography>
          <ArrowOutwardIcon sx={{ fontSize: '1.1rem' }} />
        </Stack>
      </Stack>
    </>
  );
}
