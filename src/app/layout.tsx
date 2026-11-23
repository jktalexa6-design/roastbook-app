import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RoastBookProvider } from '@/context/RoastBookContext';

export const metadata: Metadata = {
  title: 'RoastBook POS & Accounting - UMKM Biji Kopi Sangrai',
  description:
    'Aplikasi pembukuan keuangan, manajemen persediaan stok weighted average, dan kalkulator HPP otomatis untuk UMKM Roasted Bean Trading.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RoastBook',
  },
};

export const viewport: Viewport = {
  themeColor: '#1F2421',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-roast-warmbg text-roast-charcoal antialiased">
        <RoastBookProvider>{children}</RoastBookProvider>
      </body>
    </html>
  );
}
