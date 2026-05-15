/**
 * GLSL for the spiral tiles. Minimal by design: a per-tile edge vignette
 * and a camera-distance depth fade with mild far-tile desaturation. No
 * glow, no glitch, no postprocessing.
 *
 * Note: the camera position is passed in as `uCameraPosition` rather than
 * relying on three.js's built-in `cameraPosition` to keep the uniform set
 * explicit and matching the spec.
 */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Subtle per-tile edge vignette.
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.34, 0.86, length(centered));
    edge = mix(0.78, 1.0, edge);

    // Depth fade based on distance from the camera.
    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(8.0, 22.0, dist);
    depth = mix(0.5, 1.0, depth);

    vec3 color = tex.rgb * edge * depth;

    // Slightly desaturate far tiles (mix toward luma when depth is low).
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, mix(0.55, 1.0, depth));

    gl_FragColor = vec4(color, tex.a);
  }
`;
