import { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsTouchDevice, useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * A simple rotating globe standing in for "connected, global-scale work" —
 * a wireframe sphere (latitude/longitude grid) around a solid accent-colored
 * core, with a handful of small marker points scattered across the surface
 * like nodes on a network. It spins continuously and steadily on its own
 * (not just on hover/mouse), with a light cursor-driven tilt layered on top.
 */
function Globe() {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();
  const tilt = useRef({ x: 0, y: 0 });

  const coreMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4F46E5', roughness: 0.35, metalness: 0.1 }),
    []
  );

  const markerPositions = useMemo(() => {
    // A handful of fixed points on the sphere's surface, spherical coords.
    const points: [number, number, number][] = [];
    const coords: [number, number][] = [
      [0.6, 0.4],
      [-0.8, 1.1],
      [1.4, 2.3],
      [-1.6, 3.4],
      [0.3, 4.6],
      [-1.1, 5.5],
    ];
    coords.forEach(([lat, lon]) => {
      const r = 1.32;
      const x = r * Math.cos(lat) * Math.cos(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.sin(lon);
      points.push([x, y, z]);
    });
    return points;
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (!reducedMotion) {
      // Steady, clearly visible spin — always running, not dependent on hover.
      group.rotation.y += delta * 0.35;
      group.rotation.x += (tilt.current.y - group.rotation.x) * 0.03;
    }
  });

  useEffect(() => {
    if (reducedMotion) return;
    const handlePointerMove = (e: PointerEvent) => {
      const ny = (e.clientY / window.innerHeight - 0.5) * 0.35;
      tilt.current = { x: 0, y: ny };
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion]);

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0]}>
      {/* Wireframe shell — latitude/longitude grid, globe-like */}
      <mesh>
        <sphereGeometry args={[1.35, 22, 16]} />
        <meshBasicMaterial color="#111113" wireframe transparent opacity={0.22} />
      </mesh>

      {/* Solid core */}
      <mesh material={coreMaterial}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>

      {/* Node markers scattered across the surface */}
      {markerPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#FAFAF8" />
        </mesh>
      ))}
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
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 3, 4]} intensity={0.9} color="#ffffff" />
        <directionalLight position={[-3, -1, 2]} intensity={0.3} color="#c7c6ff" />
        <Globe />
      </Canvas>
      {isTouch && null /* touch devices simply lose the pointer-tilt nuance, kept intentionally minimal */}
    </Box>
  );
}
