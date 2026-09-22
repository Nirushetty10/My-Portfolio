import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useMediaQuery';

// Same Ashima simplex noise used across the site's shader work, kept local
// to this file so the component has no cross-file shader dependency.
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

const bodyVertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float n = snoise(position * 2.4 + uTime * 0.2);
    float displacement = n * 0.012;
    vDisplacement = n;
    vec3 displaced = position + normal * displacement;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const bodyFragmentShader = /* glsl */ `
  precision highp float;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 amber = vec3(0.878, 0.553, 0.235);
    vec3 cyan = vec3(0.298, 0.839, 0.816);
    vec3 dark = vec3(0.05, 0.05, 0.058);

    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 1.8);
    vec3 base = mix(dark, amber, 0.22 + vDisplacement * 0.4);
    vec3 rim = mix(base, cyan, fresnel * 0.8);
    vec3 color = rim + fresnel * 0.65;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface HumanFigure3DProps {
  /**
   * Scroll-driven orientation (radians), same contract as Model3D — set on
   * every frame by the pinned scroll sequence rather than left to auto-spin.
   */
  rotationRef?: React.MutableRefObject<{ y: number; x: number }>;
  /**
   * Placeholder swap point: pass a URL to a .glb/.gltf avatar once you have
   * one, and load it with three's GLTFLoader in place of buildFigure() below
   * — e.g. `new GLTFLoader().load(modelUrl, (gltf) => group.add(gltf.scene))`.
   * The rotationRef / pointer-parallax / pin logic in Hero.tsx doesn't need
   * to change: it just drives `group.rotation`, whatever is inside it.
   */
  modelUrl?: string;
}

// Rough standing-figure proportions (units are arbitrary "meters"), built
// entirely from primitives — no external asset. Swap for a real rigged
// model later; this keeps the silhouette and camera framing in the meantime.
function buildFigure(material: THREE.Material): THREE.Group {
  const figure = new THREE.Group();

  const add = (geometry: THREE.BufferGeometry, x: number, y: number, z: number, rotZ = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    figure.add(mesh);
    return mesh;
  };

  add(new THREE.SphereGeometry(0.17, 24, 24), 0, 1.72, 0);
  add(new THREE.CapsuleGeometry(0.065, 0.1, 4, 8), 0, 1.5, 0);
  add(new THREE.CapsuleGeometry(0.26, 0.5, 6, 16), 0, 1.14, 0);
  add(new THREE.CapsuleGeometry(0.24, 0.16, 6, 16), 0, 0.62, 0);

  add(new THREE.CapsuleGeometry(0.085, 0.38, 4, 12), 0.4, 1.18, 0, -0.18);
  add(new THREE.CapsuleGeometry(0.085, 0.38, 4, 12), -0.4, 1.18, 0, 0.18);
  add(new THREE.CapsuleGeometry(0.07, 0.36, 4, 12), 0.47, 0.72, 0.04, -0.05);
  add(new THREE.CapsuleGeometry(0.07, 0.36, 4, 12), -0.47, 0.72, 0.04, 0.05);

  add(new THREE.CapsuleGeometry(0.13, 0.46, 4, 12), 0.15, 0.28, 0);
  add(new THREE.CapsuleGeometry(0.13, 0.46, 4, 12), -0.15, 0.28, 0);
  add(new THREE.CapsuleGeometry(0.11, 0.46, 4, 12), 0.15, -0.24, 0);
  add(new THREE.CapsuleGeometry(0.11, 0.46, 4, 12), -0.15, -0.24, 0);

  figure.position.y -= 0.95;
  return figure;
}

export default function HumanFigure3D({ rotationRef, modelUrl }: HumanFigure3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (import.meta.env.DEV && modelUrl) {
      // eslint-disable-next-line no-console
      console.warn(
        'HumanFigure3D: modelUrl was passed but GLTF loading is not wired up yet — ' +
          'see the modelUrl doc comment on HumanFigure3DProps for the swap-in.'
      );
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 5.4);

    const group = new THREE.Group();
    scene.add(group);

    const bodyMaterial = new THREE.ShaderMaterial({
      vertexShader: bodyVertexShader,
      fragmentShader: bodyFragmentShader,
      uniforms: { uTime: { value: 0 } },
    });
    const figure = buildFigure(bodyMaterial);
    group.add(figure);

    // HUD scan shell: a slightly larger wireframe clone of the same parts.
    const scanGroup = new THREE.Group();
    const scanMaterial = new THREE.MeshBasicMaterial({
      color: 0x4cd6d0,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    figure.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const scanMesh = new THREE.Mesh(child.geometry, scanMaterial);
        scanMesh.position.copy(child.position);
        scanMesh.rotation.copy(child.rotation);
        scanMesh.scale.setScalar(1.08);
        scanGroup.add(scanMesh);
      }
    });
    scanGroup.position.copy(figure.position);
    group.add(scanGroup);

    // Neural field: a sparse particle shell around the whole figure, with
    // synapse lines and travelling data pulses — same technique as the
    // hero core, stretched into a standing-figure envelope.
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.55 + Math.random() * 0.35;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.9;
      positions[i * 3 + 1] = 0.9 + r * Math.cos(phi) * 1.9;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.9;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xe08d3c,
      size: 0.022,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    const connectDistance = 0.5;
    const maxConnectionsPerNode = 2;
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
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const synapseLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    particles.add(synapseLines);

    const pulseCount = Math.min(20, edgeIndexPairs.length);
    const pulseEdges = edgeIndexPairs
      .map((pair) => pair)
      .sort(() => Math.random() - 0.5)
      .slice(0, pulseCount)
      .map(([a, b]) => ({ a, b, speed: 0.3 + Math.random() * 0.5, phase: Math.random() }));
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: 0x8ff0ea,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
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
      targetRotation.y = nx * 0.45;
      targetRotation.x = ny * 0.15;
    };
    if (!reducedMotion) window.addEventListener('pointermove', onPointerMove);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let rafId: number;
    const clock = new THREE.Clock();

    const renderStatic = () => renderer.render(scene, camera);

    if (reducedMotion) {
      renderStatic();
    } else {
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        bodyMaterial.uniforms.uTime.value = elapsed;
        scanMaterial.opacity = 0.12 + Math.sin(elapsed * 0.5) * 0.05;

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
          const { y: scrollY, x: scrollX } = rotationRef.current;
          group.rotation.y += (scrollY + targetRotation.y * 0.2 - group.rotation.y) * 0.07;
          group.rotation.x += (scrollX + targetRotation.x * 0.2 - group.rotation.x) * 0.07;
        } else {
          group.rotation.y += (targetRotation.y - group.rotation.y) * 0.04 + 0.0012;
          group.rotation.x += (targetRotation.x - group.rotation.x) * 0.04;
        }
        particles.rotation.y += 0.0006;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (!reducedMotion) window.removeEventListener('pointermove', onPointerMove);
      figure.children.forEach((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      bodyMaterial.dispose();
      scanMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [reducedMotion, modelUrl]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: 420, md: 620 },
      }}
    />
  );
}
