# Niranjan KS — Portfolio

A clean, fast single-page portfolio built with React, TypeScript, Vite, MUI and GSAP.

This went through a few rounds of pulling back from an earlier, much heavier
version (a full cinematic build with a pinned "film reel," a persistent 3D
head, shader backdrops, film grain and a loading screen). All of that was
removed in favor of straightforward sections, normal scrolling, and one
small, tasteful 3D accent in the Hero — on the theory that a portfolio's job
is to be read quickly and clearly, not performed.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/   Reusable UI pieces (Navbar, MagneticButton, ProjectCard,
                SectionHeading, Marquee, ScrollReveal, SkillsModel)
  sections/     Page sections (Hero, SelectedWork, About, TechStack,
                Experience, Services, Contact)
  pages/        Route-level pages (Home, ProjectDetails)
  data/         Content: projects.ts, experience.ts, technologies.ts
  theme/        Custom MUI theme (theme.ts)
  hooks/        useLenis (smooth scroll), useMediaQuery (reduced motion /
                touch / desktop)
```

Content lives in `src/data/` and is separate from UI — edit those files to
change project copy, the experience timeline, or the tech list without
touching components.

## What's actually on the page

- **Hero** — a short headline, one line of supporting copy, two buttons, and
  a small 3D object (`components/SkillsModel`) standing in for "connected,
  global-scale work": a real, textured Earth — day map, specular map (oceans
  read glossier than land), normal map (terrain relief) and an
  independently-rotating cloud layer, tilted on its axis like the real
  thing. The imagery (`public/textures/earth_*`) is the same public-domain,
  NASA-derived set used in three.js's own official Earth example — see the
  licensing note below. It's lazy-loaded (`React.lazy` + `Suspense` in
  `Hero.tsx`) so the three.js JS chunk *and* the ~1.3MB of texture files
  download in the background instead of blocking the rest of the page from
  rendering. It spins on its own, steadily, all the time — not just on
  hover.
- **Selected Work** — a plain two-column responsive grid of project cards.
  Normal document scroll, no pinning, no scroll-jacking. Each card has a
  light cursor-following tilt (capped at ~5°) and the thumbnail zooms
  slightly on hover — both skipped on touch and under reduced motion.
- **Tech Stack** — a genuinely auto-scrolling marquee (`components/Marquee`),
  not just a hover list. Pauses on hover so a name can be read; renders as a
  plain static row under reduced motion instead of stopping mid-scroll.
- **About, Experience, Services, Contact** — plain sections with moderate,
  readable type sizes (no clamp() sizes above ~3.5rem anywhere on the page)
  and fade/lift reveals on scroll (`ScrollReveal`).
- **Page transitions** — navigating between Home and a project detail page
  now has a real enter/exit transition (`components/PageTransition` +
  `AnimatePresence` from Framer Motion in `App.tsx`): the new page slides in
  from the right as the old one slides out to the left, rather than a hard
  cut. This is the one place a small extra dependency (Framer Motion) was
  worth it — GSAP alone can't animate an element *out* before it unmounts
  without significantly more manual wiring.
- **Scroll progress bar** — a 2px indicator fixed to the top of the viewport
  (`components/ScrollProgress`), filling as you scroll down the page.
- A few small hover details tie it together: nav links get an underline
  that draws in on hover, and arrow icons on CTAs/links nudge forward a few
  pixels on hover (wired once into the MUI Button theme override for any
  button with an `endIcon`, plus per-instance on the plain link in Contact
  and the arrow in ProjectCard).

## Design decisions worth knowing about

- **No loading screen.** An earlier version had a ~2 second cinematic
  percentage-counter intro before the page was visible. Removed — a delay
  before content appears is a UX cost with no real benefit here.
- **No custom cursor, no film grain overlay, no full-screen shader
  background.** These were purely decorative and added visual noise without
  helping anyone read the content faster or trust it more.
- **No persistent 3D head or scroll-jacked sections.** Earlier iterations
  had a continuously visible 3D head following scroll position, a pinned
  "film reel" for projects, and a pinned horizontal Experience timeline.
  All removed for the same reason: neat as a trick, bad as UX for content
  someone is trying to actually read.
- **Reduced motion is checked everywhere animation happens** —
  `ScrollReveal`, `SkillsModel`, `MagneticButton`, `ProjectCard`'s tilt/zoom,
  `Marquee`, and `PageTransition` all fall back to a static, fully legible,
  non-animated state. Content is never gated behind motion.

## NEEDS_CONFIRMATION — things to fill in before shipping

- **Project screenshots**: `src/data/projects.ts` has an empty `image`
  field per project; `ProjectCard.tsx` and `ProjectDetails.tsx` currently
  render placeholder gradients. Drop real screenshots into `src/assets/`
  and wire them in.
- **Project outcomes**: each project's `detail.result` is marked
  `NEEDS_CONFIRMATION` — add a real, specific outcome once you have one
  (metrics, adoption, feedback).
- **Contact links**: `src/sections/Contact/Contact.tsx` has placeholder
  GitHub/LinkedIn/email links — replace with your real profiles.
- **Fonts**: this build uses **Space Grotesk** (display) + **Inter** (body)
  — see `index.html`. Swap in different fonts there and in
  `src/theme/theme.ts` if you'd rather use something else.
- **Experience timeline copy**: `src/data/experience.ts` describes each
  year in general terms since no employer names were supplied — add
  specifics if you want them named.

## Asset licensing note

The Earth textures in `public/textures/` (`earth_atmos_2048.jpg`,
`earth_specular_2048.jpg`, `earth_normal_2048.jpg`,
`earth_clouds_1024.png`) are NASA-derived imagery (Blue Marble / cloud
composite data), redistributed as public-domain example assets in the
official [three.js repository](https://github.com/mrdoob/three.js) — the
same files used in their own `webgl_earth` demo. NASA imagery itself is
public domain; three.js redistributes it under their MIT-licensed examples.
No additional attribution is legally required, but it's good practice to
credit NASA/three.js if you want to.

