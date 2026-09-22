import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../../three/scrollState';
import { interpKeyframes, type Keyframe } from '../../three/interpKeyframes';
import { useReducedMotion } from '../../hooks/useMediaQuery';

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

const headVertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    float n = snoise(position * 2.8 + uTime * 0.15);
    float displacement = n * 0.02;
    vDisplacement = n;
    vec3 displaced = position + normal * displacement;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const headFragmentShader = /* glsl */ `
  precision highp float;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 amber = vec3(0.878, 0.553, 0.235);
    vec3 cyan = vec3(0.298, 0.839, 0.816);
    vec3 dark = vec3(0.045, 0.045, 0.05);

    // Fixed world-space key light — as the head turns, different facets
    // catch it, which is what actually reads as a change of angle.
    vec3 lightDir = normalize(vec3(0.5, 0.7, 0.5));
    float diffuse = max(dot(vWorldNormal, lightDir), 0.0);

    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.4);

    vec3 base = mix(dark, amber, diffuse * 0.8 + vDisplacement * 0.1 + 0.08);
    vec3 rim = mix(base, cyan, fresnel * 0.6);
    vec3 color = rim + fresnel * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Pose keyframes across the *entire page's* scroll progress (0 = top, 1 =
// bottom) — approximate section boundaries. yaw/pitch are radians; posX/
// posY are world units; scale is a uniform multiplier. The head turns to
// alternating sides through the content sections and returns to face
// forward, centered, near the very end (Contact).
const yawKeyframes: Keyframe[] = [
  [0, -0.08],
  [0.08, 0.55],
  [0.32, -0.42],
  [0.55, 0.48],
  [0.78, -0.32],
  [0.95, 0],
];
const pitchKeyframes: Keyframe[] = [
  [0, 0.02],
  [0.08, -0.06],
  [0.32, 0.05],
  [0.55, -0.07],
  [0.78, 0.06],
  [0.95, 0],
];
const posXKeyframes: Keyframe[] = [
  [0, 0.95],
  [0.08, -0.9],
  [0.32, 0.85],
  [0.55, -0.8],
  [0.78, 0.8],
  [0.95, 0],
];
const posYKeyframes: Keyframe[] = [
  [0, -0.05],
  [0.08, 0.2],
  [0.32, -0.1],
  [0.55, 0.15],
  [0.78, -0.05],
  [0.95, -0.02],
];
const scaleKeyframes: Keyframe[] = [
  [0, 1.1],
  [0.08, 0.55],
  [0.32, 0.6],
  [0.55, 0.5],
  [0.78, 0.55],
  [0.95, 1.0],
];

export default function HolographicHead() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const pivotGroupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const breatheGroupRef = useRef<THREE.Group>(null);

  const reducedMotion = useReducedMotion();
  const blinkTimer = useRef(2 + Math.random() * 2);
  const blinkPhase = useRef(-1); // -1 = not blinking; otherwise seconds elapsed into the blink

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: headVertexShader,
        fragmentShader: headFragmentShader,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  useFrame((state, delta) => {
    const outer = outerGroupRef.current;
    const pivot = pivotGroupRef.current;
    if (!outer || !pivot) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;

    if (reducedMotion) {
      // Static, centered, facing forward — no motion at all.
      outer.position.set(0, 0, 0);
      outer.scale.setScalar(1);
      pivot.rotation.set(0, 0, 0);
      return;
    }

    const p = scrollState.progress;
    const targetYaw = interpKeyframes(p, yawKeyframes);
    const targetPitch = interpKeyframes(p, pitchKeyframes);
    const targetX = interpKeyframes(p, posXKeyframes);
    const targetY = interpKeyframes(p, posYKeyframes);
    const targetScale = interpKeyframes(p, scaleKeyframes);

    const ease = 1 - Math.pow(0.001, delta); // frame-rate independent smoothing
    pivot.rotation.y += (targetYaw - pivot.rotation.y) * ease;
    pivot.rotation.x += (targetPitch - pivot.rotation.x) * ease;
    outer.position.x += (targetX - outer.position.x) * ease;
    outer.position.y += (targetY - outer.position.y) * ease;
    const currentScale = outer.scale.x + (targetScale - outer.scale.x) * ease;
    outer.scale.setScalar(currentScale);

    // Idle breathing — a slow uniform scale pulse, independent of scroll.
    if (breatheGroupRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.012;
      breatheGroupRef.current.scale.setScalar(breathe);
    }

    // Idle blinking — a quick triangular close/open on a loose timer.
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0 && blinkPhase.current < 0) {
      blinkPhase.current = 0;
    }
    if (blinkPhase.current >= 0) {
      blinkPhase.current += delta;
      const blinkDuration = 0.22;
      const t = blinkPhase.current / blinkDuration;
      const closeAmount = t < 0.5 ? t * 2 : (1 - t) * 2; // triangle 0->1->0
      const eyeScaleY = Math.max(0.06, 1 - Math.min(1, closeAmount));
      if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;
      if (t >= 1) {
        blinkPhase.current = -1;
        blinkTimer.current = 2.5 + Math.random() * 3.5;
      }
    }
  });

  return (
    <group ref={outerGroupRef}>
      {/* Pivot sits at roughly neck height so rotation reads as a head
          turn/tilt rather than the whole object spinning about its own
          bounding-box center. */}
      <group ref={pivotGroupRef} position={[0, -0.55, 0]}>
        <group ref={breatheGroupRef} position={[0, 0.55, 0]}>
          {/* Skull — ellipsoid via non-uniform scale, self-lit shader */}
          <mesh material={material} scale={[0.78, 0.95, 0.85]}>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>

          {/* Jaw — smaller, flatter sphere breaking pure symmetry */}
          <mesh material={material} position={[0, -0.62, 0.28]} scale={[0.52, 0.34, 0.5]}>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>

          {/* Eyes */}
          <mesh ref={leftEyeRef} position={[-0.28, 0.08, 0.78]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#4cd6d0" />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.28, 0.08, 0.78]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#4cd6d0" />
          </mesh>

          {/* Wireframe halo — HUD scan feel, matches the site's other 3D accents */}
          <mesh rotation={[0.3, 0.4, 0]}>
            <icosahedronGeometry args={[1.35, 1]} />
            <meshBasicMaterial
              color="#e08d3c"
              wireframe
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
