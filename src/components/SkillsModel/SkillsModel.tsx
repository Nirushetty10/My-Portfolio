import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { BackSide, Color, Group, Mesh, TextureLoader, Vector2 } from 'three';
import { useIsTouchDevice, useReducedMotion } from '../../hooks/useMediaQuery';

const TEXTURE_BASE = '/textures';

/**
 * A real Earth — day-map, specular map (oceans read glossier than land),
 * normal map (terrain relief) and an independently-rotating cloud layer,
 * using the same public-domain NASA-derived imagery from three.js's own
 * official Earth example. Tilted on its axis like the real thing, and
 * spinning continuously and steadily on its own, with a light cursor tilt
 * layered on top.
 */
function Globe() {
  const groupRef = useRef<Group>(null);
  const cloudsRef = useRef<Mesh>(null);
  const reducedMotion = useReducedMotion();
  const tilt = useRef({ y: 0 });

  const [colorMap, specularMap, normalMap, cloudsMap] = useLoader(TextureLoader, [
    `${TEXTURE_BASE}/earth_atmos_2048.jpg`,
    `${TEXTURE_BASE}/earth_specular_2048.jpg`,
    `${TEXTURE_BASE}/earth_normal_2048.jpg`,
    `${TEXTURE_BASE}/earth_clouds_1024.png`,
  ]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (!reducedMotion) {
      // Steady, clearly visible spin — always running, not dependent on hover.
      group.rotation.y += delta * 0.18;
      group.rotation.z += (tilt.current.y - group.rotation.z) * 0.03;
      if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.045;
    }
  });

  useEffect(() => {
    if (reducedMotion) return;
    const handlePointerMove = (e: PointerEvent) => {
      const ny = (e.clientY / window.innerHeight - 0.5) * 0.2;
      tilt.current = { y: ny };
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion]);

  return (
    // Axial tilt, roughly matching Earth's real ~23.4°
    <group ref={groupRef} rotation={[0, 0, 0.41]}>
      <mesh>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          specularMap={specularMap}
          normalMap={normalMap}
          normalScale={new Vector2(0.85, 0.85)}
          specular={new Color('#555555')}
          shininess={7}
        />
      </mesh>

      {/* Cloud layer — slightly larger, semi-transparent, rotates independently */}
      <mesh ref={cloudsRef} scale={1.015}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.7} depthWrite={false} />
      </mesh>

      {/* Thin atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial color="#8b8bf0" transparent opacity={0.1} side={BackSide} />
      </mesh>
    </group>
  );
}

interface SkillsModelProps {
  height?: number | { xs?: number; md?: number };
}

export default function SkillsModel({ height = 420 }: SkillsModelProps) {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  return (
    <Box sx={{ width: '100%', height, minHeight: 260 }}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ fov: 40, near: 0.1, far: 20, position: [0, 0, 4.6] }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 2, 4]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[-3, -1, 2]} intensity={0.25} color="#c7c6ff" />
        <Globe />
      </Canvas>
      {isTouch && null /* touch devices simply lose the pointer-tilt nuance, kept intentionally minimal */}
    </Box>
  );
}
