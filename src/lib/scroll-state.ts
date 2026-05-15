/**
 * Shared, mutable scroll/interaction state.
 *
 * This is the single bridge between the Lenis scroll source (lib/lenis.ts)
 * and the Three.js render loop (components/hero/SpiralScene.tsx). Both sides
 * read and write this plain object every frame — no React state, no re-renders.
 */
export type ScrollState = {
  scrollProgress: number;
  scrollVelocity: number;
  spinVelocity: number;
  currentTiltX: number;
  targetTiltX: number;
  currentTiltZ: number;
  targetTiltZ: number;
  targetCameraY: number;
  currentCameraY: number;
  mouseX: number;
  mouseY: number;
};

export const scrollState: ScrollState = {
  scrollProgress: 0,
  scrollVelocity: 0,
  spinVelocity: 0,
  currentTiltX: 0,
  targetTiltX: 0,
  currentTiltZ: 0,
  targetTiltZ: 0,
  targetCameraY: 0,
  currentCameraY: 0,
  mouseX: 0,
  mouseY: 0,
};
