/**
 * Fixed film-grain overlay. The SVG feTurbulence noise lives as an inline
 * data-URI background on the `.grain` utility in globals.css (no inline
 * style attribute). Pointer-events none, mix-blend overlay.
 */
export default function Grain() {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay"
    />
  );
}
