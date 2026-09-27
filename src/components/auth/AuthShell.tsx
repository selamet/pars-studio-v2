import Link from 'next/link';

/**
 * Page frame shared by every account screen: eyebrow row, serif heading,
 * intro and a narrow column for the form. Native scroll (no Lenis), like
 * the booking page.
 */
export default function AuthShell({
  eyebrow,
  label,
  heading,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  label: string;
  heading: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main>
      <section className="section min-h-screen pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <div className="mx-auto w-full max-w-md">
            <header className="mb-12">
              <div className="flex items-center gap-5">
                <span className="meta !text-accent">{eyebrow}</span>
                <span className="h-px w-12 bg-rule" aria-hidden />
                <span className="meta">{label}</span>
              </div>
              <h1 className="mt-7 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,4.5vw,64px)]">
                {heading}
              </h1>
              {intro && (
                <p className="mt-5 text-[15px] leading-[1.7] text-fg/[0.7]">{intro}</p>
              )}
            </header>

            {children}

            {footer && (
              <footer className="mt-10 border-t border-rule pt-6 text-[13px] text-fg-dim">
                {footer}
              </footer>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-fg underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
    >
      {children}
    </Link>
  );
}
