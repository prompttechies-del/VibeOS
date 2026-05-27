import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import '../index.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'VibeOS — AI meeting notes for engineering teams',
  description: 'VibeOS — AI meeting notes for engineering teams. Action items, decisions, and context — auto-extracted from every standup, sync, and incident review.',
  openGraph: {
    title: 'VibeOS — AI meeting notes for engineering teams',
    description: 'Stop taking notes. Start shipping.',
    type: 'website',
  },
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
