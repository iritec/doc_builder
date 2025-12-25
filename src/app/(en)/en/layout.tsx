import type { Metadata } from 'next';
import { Montserrat, Noto_Sans_JP } from 'next/font/google';
import '../../globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'DocBuilder | Create Specifications with AI',
  description:
    'A tool to progressively create product specifications through dialogue with Claude Opus 4. Organize everything from project overview to tech stack through 5-phase structured interviews.',
  keywords: [
    'specifications',
    'AI',
    'Claude',
    'spec creation',
    'product development',
    'requirements',
    'documentation',
  ],
  authors: [{ name: 'Shingo Irie', url: 'https://shingoirie.com/' }],
  openGraph: {
    title: 'DocBuilder | Create Specifications with AI',
    description:
      'A tool to progressively create product specifications through dialogue with Claude Opus 4. Organize everything from project overview to tech stack through 5-phase structured interviews.',
    type: 'website',
    locale: 'en_US',
    siteName: 'DocBuilder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocBuilder | Create Specifications with AI',
    description:
      'A tool to progressively create product specifications through dialogue with Claude Opus 4.',
    creator: '@and_and_and',
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${notoSansJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

