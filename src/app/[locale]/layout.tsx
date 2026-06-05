import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
import { locales, type Locale } from '@/i18n';
import Providers from '@/components/Providers';
import Navbar from '@/components/nav/Navbar';
import Grain from '@/components/Grain';
import WhatsappButton from '@/components/WhatsappButton';

const serif = Fraunces({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pars Studios — Kayıt · Miks · Mastering · Beat',
  description:
    'Pars Studios — İstanbul merkezli bağımsız müzik prodüksiyon stüdyosu. Kayıt, miks, mastering ve beat prodüksiyon.',
  metadataBase: new URL('https://parsstudio.com'),
  openGraph: {
    type: 'website',
    siteName: 'Pars Studios',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'Pars Studios',
  url: 'https://parsstudio.com',
  description:
    'Independent music production studio in Istanbul — recording, mixing, mastering and beat production.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Şişli',
    addressRegion: 'Istanbul',
    addressCountry: 'TR',
    streetAddress: 'Bomonti',
  },
  telephone: '+90 531 393 20 83',
  email: 'online@pars-studios.com',
  sameAs: [
    'https://instagram.com',
    'https://soundcloud.com',
    'https://spotify.com',
  ],
  makesOffer: [
    { '@type': 'Offer', name: 'Recording' },
    { '@type': 'Offer', name: 'Mixing' },
    { '@type': 'Offer', name: 'Mastering' },
    { '@type': 'Offer', name: 'Beat Production' },
    { '@type': 'Offer', name: 'Vocal Production' },
  ],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Grain />
          <Navbar />
          <Providers>{children}</Providers>
          <WhatsappButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
