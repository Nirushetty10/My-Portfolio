import { Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import HolographicHead from './HolographicHead';

/**
 * Mounted once, early in App.tsx (before Navbar/Routes). Sits fixed behind
 * all page content — sections without their own opaque background (most of
 * them) let it show through, which is what makes the head read as "present
 * behind the interface" rather than confined to one section. Pointer events
 * are disabled throughout so it never intercepts clicks on real UI.
 */
export default function PersonPresence() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ fov: 32, near: 0.1, far: 20, position: [0, 0.1, 5.4] }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <fog attach="fog" args={['#0a0a0b', 4.5, 10]} />
        <HolographicHead />
      </Canvas>
    </Box>
  );
}
