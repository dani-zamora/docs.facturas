import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Hanken_Grotesk, EB_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Fuentes de marca self-hosteadas por next/font. Sustituye al @import remoto de
// Google Fonts, que el minificador de Tailwind v4 descartaba en producción.
const fontSans = Hanken_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-hanken' });
const fontSerif = EB_Garamond({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-eb-garamond' });
const fontMono = JetBrains_Mono({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-jetbrains' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
    >
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
