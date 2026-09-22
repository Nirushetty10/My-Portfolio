import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mutable singleton read every animation frame by 3D components (the
 * persistent head, in particular). Written exactly once, imperatively, by
 * the hook below — components read `scrollState.progress` directly inside
 * their own render loops rather than re-rendering on every scroll tick.
 */
export const scrollState = { progress: 0 };

/**
 * Creates a single ScrollTrigger spanning the entire document (0 at the
 * very top, 1 at the very bottom) and keeps `scrollState.progress` in sync.
 * Call this exactly once, high in the tree — see App.tsx.
 */
export function useGlobalScrollProgress() {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
    });

    // Other sections pin themselves (extending document height) after mount —
    // re-measure once everything has settled so 1.0 still means "true bottom".
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = setTimeout(refresh, 500);

    return () => {
      trigger.kill();
      window.removeEventListener('load', refresh);
      clearTimeout(t);
    };
  }, []);
}
