'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { scrollState } from '@/lib/scroll-state';
import { vertexShader, fragmentShader } from './shaders';

const CONFIG = {
  totalImages: 10,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
};

/**
 * Curved BufferGeometry tile (NOT a PlaneGeometry). Walks segments+1 slices
 * along an arc, pushing a top + bottom vertex at each slice, then stitches
 * triangle pairs between adjacent slices.
 */
function createCurvedTileGeometry(
  radius: number,
  arcAngle: number,
  tileHeight: number,
  segments: number
) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const halfH = tileHeight / 2;

  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const theta = -arcAngle / 2 + t * arcAngle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    // top vertex
    positions.push(x, halfH, z);
    uvs.push(t, 1);
    // bottom vertex
    positions.push(x, -halfH, z);
    uvs.push(t, 0);
  }

  for (let s = 0; s < segments; s++) {
    const topA = s * 2;
    const botA = s * 2 + 1;
    const topB = (s + 1) * 2;
    const botB = (s + 1) * 2 + 1;

    indices.push(topA, botA, topB);
    indices.push(botA, botB, topB);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** 1×1 dark-grey fallback used when a cover image fails to load. */
function makeFallbackTexture() {
  const data = new Uint8Array([22, 22, 24, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function loadTextures(renderer: THREE.WebGLRenderer) {
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const jobs = Array.from({ length: CONFIG.totalImages }, (_, i) => {
    const src = `/images/covers/cover${i + 1}.jpg`;
    return new Promise<THREE.Texture>((resolve) => {
      loader.load(
        src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAniso;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        () => resolve(makeFallbackTexture())
      );
    });
  });

  return Promise.all(jobs);
}

export default function SpiralScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let idleId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let spiral: THREE.Group | null = null;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.ShaderMaterial[] = [];
    let textures: THREE.Texture[] = [];

    let isMobile = window.innerWidth < 768;

    const init = async () => {
      if (disposed || !container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, CONFIG.cameraZ + (isMobile ? 3 : 0));

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      textures = await loadTextures(renderer);
      if (disposed) return;

      // ── Build the helix ──────────────────────────────────────────────
      const totalTiles = CONFIG.tilesPerRevolution * CONFIG.revolutions; // 75
      const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;
      const arcAngle = angleStep + CONFIG.tileOverlap;
      const chord = 2 * CONFIG.startRadius * Math.sin(angleStep / 2);
      const tileHeight = chord * CONFIG.tileHeightRatio;
      const startY = ((totalTiles - 1) * CONFIG.spiralGap) / 2;

      spiral = new THREE.Group();

      for (let i = 0; i < totalTiles; i++) {
        const lerpT = totalTiles > 1 ? i / (totalTiles - 1) : 0;
        const radius =
          CONFIG.startRadius +
          (CONFIG.endRadius - CONFIG.startRadius) * lerpT;

        const geometry = createCurvedTileGeometry(
          radius,
          arcAngle,
          tileHeight,
          CONFIG.tileSegments
        );
        geometries.push(geometry);

        const texIndex = i % CONFIG.totalImages;
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uMap: { value: textures[texIndex] },
            uCameraPosition: { value: camera.position },
          },
          side: THREE.DoubleSide,
          transparent: true,
        });
        materials.push(material);

        const tile = new THREE.Mesh(geometry, material);
        tile.position.y = startY - i * CONFIG.spiralGap;
        tile.rotation.y = i * angleStep;
        spiral.add(tile);
      }

      spiral.position.y = CONFIG.spiralOffsetY;
      scene.add(spiral);

      // Fade the canvas in once everything is ready.
      container.classList.remove('opacity-0');
      container.classList.add('opacity-100');

      // ── Render loop ──────────────────────────────────────────────────
      const renderLoop = () => {
        if (disposed || !renderer || !scene || !camera || !spiral) return;
        rafId = requestAnimationFrame(renderLoop);

        spiral.rotation.y +=
          CONFIG.baseRotationSpeed + scrollState.spinVelocity;
        scrollState.spinVelocity *= CONFIG.rotationDecay;

        if (!isMobile) {
          scrollState.currentTiltX +=
            (scrollState.targetTiltX - scrollState.currentTiltX) *
            CONFIG.cameraSmoothing;
          scrollState.currentTiltZ +=
            (scrollState.targetTiltZ - scrollState.currentTiltZ) *
            CONFIG.cameraSmoothing;
          spiral.rotation.x = scrollState.currentTiltX;
          spiral.rotation.z = scrollState.currentTiltZ;
        }

        scrollState.targetCameraY =
          -scrollState.scrollProgress * CONFIG.cameraYMultiplier * 10;
        scrollState.currentCameraY +=
          (scrollState.targetCameraY - scrollState.currentCameraY) *
          CONFIG.cameraSmoothing;
        camera.position.y = scrollState.currentCameraY;
        camera.lookAt(0, scrollState.currentCameraY * 0.4, 0);

        renderer.render(scene, camera);
      };
      renderLoop();
    };

    // ── Interaction ────────────────────────────────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      if (isMobile) return;
      scrollState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      scrollState.targetTiltX = scrollState.mouseY * CONFIG.parallaxStrength;
      scrollState.targetTiltZ =
        scrollState.mouseX * CONFIG.parallaxStrength * -0.5;
    };

    const onResize = () => {
      if (!renderer || !camera || !container) return;
      isMobile = window.innerWidth < 768;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.position.z = CONFIG.cameraZ + (isMobile ? 3 : 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (isMobile && spiral) {
        scrollState.targetTiltX = 0;
        scrollState.targetTiltZ = 0;
        scrollState.currentTiltX = 0;
        scrollState.currentTiltZ = 0;
        spiral.rotation.x = 0;
        spiral.rotation.z = 0;
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);

    // ── Deferred WebGL init (idle, 1500ms timeout, fallback double rAF) ──
    const ric = (
      window as unknown as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number }
        ) => number;
      }
    ).requestIdleCallback;

    if (typeof ric === 'function') {
      idleId = ric(() => void init(), { timeout: 1500 });
    } else {
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => void init());
      });
    }

    // ── Teardown ───────────────────────────────────────────────────────
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      const cic = (
        window as unknown as {
          cancelIdleCallback?: (id: number) => void;
        }
      ).cancelIdleCallback;
      if (typeof cic === 'function' && idleId) cic(idleId);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-0 ease-out [transition:opacity_800ms_ease-out]"
      aria-hidden
    />
  );
}
