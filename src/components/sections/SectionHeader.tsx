/** Shared label + section-number + heading block used by every section. */
export default function SectionHeader({
  section,
  label,
  heading,
}: {
  section: string;
  label: string;
  heading: string;
}) {
  return (
    <header className="mb-[clamp(48px,7vh,96px)]">
      <div className="reveal-text flex items-center gap-5">
        <span className="meta !text-accent">{section}</span>
        <span className="h-px w-12 bg-rule" aria-hidden />
        <span className="meta">{label}</span>
      </div>
      <h2 className="reveal-text mt-7 max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]">
        {heading}
      </h2>
    </header>
  );
}
