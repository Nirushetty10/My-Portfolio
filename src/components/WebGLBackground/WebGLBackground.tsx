import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useMediaQuery';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Flowing, cinematic noise field in the site's amber / cyan palette.
// Classic Ashima simplex noise (3D) — small, dependency-free, GPU-cheap.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;

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

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    vec2 mouseOffset = (uMouse - 0.5) * aspect * 0.4;
    float t = uTime * 0.035;

    float n1 = snoise(vec3(p * 1.4 + mouseOffset * 0.5, t));
    float n2 = snoise(vec3(p * 2.6 - mouseOffset * 0.3, t * 1.6 + 4.0));
    float field = n1 * 0.65 + n2 * 0.35;

    vec3 amber = vec3(0.878, 0.553, 0.235);
    vec3 cyan = vec3(0.298, 0.839, 0.816);
    vec3 base = vec3(0.039, 0.039, 0.043);

    float mixA = smoothstep(-0.1, 0.55, field);
    float mixB = smoothstep(0.15, 0.7, -field + 0.3);

    vec3 color = base;
    color = mix(color, amber, mixA * 0.42 * uIntensity);
    color = mix(color, cyan, mixB * 0.22 * uIntensity);

    float vignette = smoothstep(1.05, 0.15, length(p));
    color = mix(base, color, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface WebGLBackgroundProps {
  intensity?: number;
  interactive?: boolean;
}

/**
 * Full-bleed, GPU-driven aurora/noise backdrop. Renders a single full-screen
 * triangle with a fragment shader — no geometry, no lighting, minimal cost.
 * Falls back to nothing (parent should supply a CSS gradient fallback) when
 * prefers-reduced-motion is set or WebGL is unavailable.
 */
export default function WebGLBackground({ intensity = 1, interactive = true }: WebGLBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const container = containerRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
    );
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: intensity },
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
      renderer.setPixelRatio(pixelRatio);
      uniforms.uResolution.value.set(clientWidth, clientHeight);
    };

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    resize();

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
    };
    if (interactive) window.addEventListener('pointermove', onPointerMove);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let rafId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.lerp(targetMouse, 0.04);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (interactive) window.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [reducedMotion, intensity, interactive]);

  if (reducedMotion) {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 40% 35%, rgba(224,141,60,0.16), rgba(76,214,208,0.06) 45%, #0A0A0B 72%)',
        }}
      />
    );
  }

  return <Box ref={containerRef} sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }} />;
}
