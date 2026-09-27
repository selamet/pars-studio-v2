import Link from 'next/link';

/**
 * Page frame shared by every account screen: eyebrow row, serif heading and
 * intro. `narrow` centres a form-sized column (login, signup, reset); `wide`
 * spans the shell for hubs and lists. Native scroll (no Lenis), like the
 * booking page.
 */
export default function AuthShell({
  eyebrow,
  label,
  heading,
  intro,
  children,
  footer,
  width = 'narrow',
}: {
  eyebrow: string;
  label: string;
  heading: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'narrow' | 'wide';
}) {
  const wide = width === 'wide';
  return (
    <main>
      <section className="section min-h-screen pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <div className={wide ? 'w-full' : 'mx-auto w-full max-w-md'}>
            <header className={wide ? 'mb-[clamp(40px,6vh,72px)]' : 'mb-12'}>
              <div className="flex items-center gap-5">
                <span className="meta !text-accent">{eyebrow}</span>
                <span className="h-px w-12 bg-rule" aria-hidden />
                <span className="meta">{label}</span>
              </div>
              <h1
                className={
                  wide
                    ? 'mt-7 max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]'
                    : 'mt-7 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,4.5vw,64px)]'
                }
              >
                {heading}
              </h1>
              {intro && (
                <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">{intro}</p>
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
