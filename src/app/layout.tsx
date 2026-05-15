import './globals.css';

/**
 * Pass-through root layout. The real <html>/<body>, fonts and providers
 * live in app/[locale]/layout.tsx so next-intl can scope them per locale.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
