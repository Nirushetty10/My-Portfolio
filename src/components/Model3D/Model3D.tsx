import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useMediaQuery';

// Shared Ashima simplex noise (3D) — used to displace the core's surface.
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0,1.0/3.0);
    const vec4 D = vec4(0.0,0.5,1.0,2.0);
    vec3 i = floor(v+dot(v,C.yyy));
    vec3 x0 = v-i+dot(i,C.xxx);
    vec3 g = step(x0.yzx,x0.xyz);
    vec3 l = 1.0-g;
    vec3 i1 = min(g.xyz,l.zxy);
    vec3 i2 = max(g.xyz,l.zxy);
    vec3 x1 = x0-i1+C.xxx;
    vec3 x2 = x0-i2+C.yyy;
    vec3 x3 = x0-D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_*D.wyz-D.xzx;
    vec4 j = p-49.0*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j-7.0*x_);
    vec4 x = x_*ns.x+ns.yyyy;
    vec4 y = y_*ns.x+ns.yyyy;
    vec4 h = 1.0-abs(x)-abs(y);
    vec4 b0 = vec4(x.xy,y.xy);
    vec4 b1 = vec4(x.zw,y.zw);
    vec4 s0 = floor(b0)*2.0+1.0;
    vec4 s1 = floor(b1)*2.0+1.0;
    vec4 sh = -step(h,vec4(0.0));
    vec4 a0 = b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m = m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const coreVertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float n = snoise(position * 1.6 + uTime * 0.25);
    float displacement = n * 0.16;
    vDisplacement = n;
    vec3 displaced = position + normal * displacement;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const coreFragmentShader = /* glsl */ `
  precision highp float;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 amber = vec3(0.878, 0.553, 0.235);
    vec3 cyan = vec3(0.298, 0.839, 0.816);
    vec3 dark = vec3(0.04, 0.04, 0.045);

    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.2);
    vec3 base = mix(dark, amber, 0.35 + vDisplacement * 0.6);
    vec3 rim = mix(base, cyan, fresnel * 0.85);
    vec3 color = rim + fresnel * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Model3DProps {
  /**
   * When provided, the core's base orientation tracks this ref's values
   * (radians) every frame instead of auto-rotating — used to drive the
   * model from scroll progress. Pointer parallax is still blended on top,
   * at a reduced weight, so it stays a little alive under the cursor.
   */
  rotationRef?: React.MutableRefObject<{ y: number; x: number }>;
}

/**
 * A self-illuminated, real-time-rendered 3D object: a noise-displaced
 * icosahedron "core" wrapped in a translucent wireframe shell, orbited by a
 * sparse particle field. Everything is procedural — no external model file —
 * built directly with three.js buffer geometry and GLSL shaders.
 */
export default function Model3D({ rotationRef }: Model3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    const group = new THREE.Group();
    scene.add(group);

    // Core: displaced icosahedron, self-lit via custom shader.
    const coreGeometry = new THREE.IcosahedronGeometry(1.15, 24);
    const coreMaterial = new THREE.ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      uniforms: { uTime: { value: 0 } },
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // Wireframe shell, slightly larger, additive for a HUD-scan feel.
    const wireGeometry = new THREE.IcosahedronGeometry(1.32, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x4cd6d0,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const wireShell = new THREE.Mesh(wireGeometry, wireMaterial);
    group.add(wireShell);

    // Particle field: sparse points orbiting the core in a thin spherical shell.
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.9 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xe08d3c,
      size: 0.028,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Synapse net: thin glowing lines between nearby particles, turning the
    // orbiting field into a neural mesh rather than loose dust.
    const connectDistance = 0.62;
    const maxConnectionsPerNode = 3;
    const edgeIndexPairs: [number, number][] = [];
    for (let i = 0; i < particleCount; i++) {
      let connections = 0;
      for (let j = i + 1; j < particleCount && connections < maxConnectionsPerNode; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < connectDistance * connectDistance) {
          edgeIndexPairs.push([i, j]);
          connections++;
        }
      }
    }
    const edgePositions = new Float32Array(edgeIndexPairs.length * 6);
    edgeIndexPairs.forEach(([a, b], k) => {
      edgePositions[k * 6] = positions[a * 3];
      edgePositions[k * 6 + 1] = positions[a * 3 + 1];
      edgePositions[k * 6 + 2] = positions[a * 3 + 2];
      edgePositions[k * 6 + 3] = positions[b * 3];
      edgePositions[k * 6 + 4] = positions[b * 3 + 1];
      edgePositions[k * 6 + 5] = positions[b * 3 + 2];
    });
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x4cd6d0,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    // Parented to `particles` (not `group`) so it inherits that object's own
    // rotation each frame automatically, staying locked to the points it connects.
    const synapseLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    particles.add(synapseLines);

    // Data pulses: small bright points that travel along a subset of
    // synapse edges on a loop, reading as signals firing through the mesh.
    const pulseCount = Math.min(28, edgeIndexPairs.length);
    const pulseEdges = edgeIndexPairs
      .map((pair, idx) => ({ pair, idx }))
      .sort(() => Math.random() - 0.5)
      .slice(0, pulseCount)
      .map(({ pair }) => ({
        a: pair[0],
        b: pair[1],
        speed: 0.35 + Math.random() * 0.55,
        phase: Math.random(),
      }));
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: 0x8ff0ea,
      size: 0.05,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    // Same reasoning: parented to `particles` so pulses stay on their edges
    // as the field rotates, instead of drifting once particles.rotation moves.
    const dataPulses = new THREE.Points(pulseGeometry, pulseMaterial);
    if (pulseCount > 0) particles.add(dataPulses);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    resize();

    const targetRotation = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotation.y = nx * 0.6;
      targetRotation.x = ny * 0.35;
    };
    if (!reducedMotion) window.addEventListener('pointermove', onPointerMove);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let rafId: number;
    const clock = new THREE.Clock();

    const renderStatic = () => {
      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      renderStatic();
    } else {
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        coreMaterial.uniforms.uTime.value = elapsed;

        // Slow diagnostic-scan breathing on the wireframe shell.
        wireMaterial.opacity = 0.14 + Math.sin(elapsed * 0.6) * 0.06;

        // Advance each data pulse along its edge and write it into the buffer.
        if (pulseCount > 0) {
          for (let p = 0; p < pulseCount; p++) {
            const { a, b, speed, phase } = pulseEdges[p];
            const t = (elapsed * speed * 0.2 + phase) % 1;
            pulsePositions[p * 3] = positions[a * 3] + (positions[b * 3] - positions[a * 3]) * t;
            pulsePositions[p * 3 + 1] = positions[a * 3 + 1] + (positions[b * 3 + 1] - positions[a * 3 + 1]) * t;
            pulsePositions[p * 3 + 2] = positions[a * 3 + 2] + (positions[b * 3 + 2] - positions[a * 3 + 2]) * t;
          }
          pulseGeometry.attributes.position.needsUpdate = true;
        }

        if (rotationRef?.current) {
          // Scroll-driven orientation, with a lighter pointer-parallax offset layered on top.
          const { y: scrollY, x: scrollX } = rotationRef.current;
          group.rotation.y += (scrollY + targetRotation.y * 0.25 - group.rotation.y) * 0.08;
          group.rotation.x += (scrollX + targetRotation.x * 0.25 - group.rotation.x) * 0.08;
        } else {
          group.rotation.y += (targetRotation.y - group.rotation.y) * 0.04 + 0.0022;
          group.rotation.x += (targetRotation.x - group.rotation.x) * 0.04;
        }
        wireShell.rotation.y -= 0.0016;
        particles.rotation.y += 0.0009;
        particles.rotation.x += 0.0004;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (!reducedMotion) window.removeEventListener('pointermove', onPointerMove);
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: 340, md: 480 },
      }}
    />
  );
}
