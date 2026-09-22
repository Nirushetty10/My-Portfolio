export type Keyframe = [progress: number, value: number];

/**
 * Linearly interpolates `value` across a sorted list of [progress, value]
 * keyframes, clamping at the ends. Used to drive pose/position/scale from
 * a single 0..1 scroll-progress number without a full animation library.
 */
export function interpKeyframes(progress: number, keyframes: Keyframe[]): number {
  if (progress <= keyframes[0][0]) return keyframes[0][1];
  const last = keyframes[keyframes.length - 1];
  if (progress >= last[0]) return last[1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    const [p0, v0] = keyframes[i];
    const [p1, v1] = keyframes[i + 1];
    if (progress >= p0 && progress <= p1) {
      const t = (progress - p0) / (p1 - p0);
      return v0 + (v1 - v0) * t;
    }
  }
  return last[1];
}
