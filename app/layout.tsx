import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Craft World Token Price',
  description: 'Track real-time Craft World Token price updates and trends.',
  icons: {
    icon: 'https://www.angrydynomiteslab.com/favicon.ico',
  },
  openGraph: {
    title: 'Craft World Token Price',
    description: 'Track real-time Craft World Token price updates and trends.',
    url: 'https://craft.notedrop.xyz',
    siteName: 'Craft World',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Craft World Token Price',
    description: 'Track real-time Craft World Token price updates and trends.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon fallback */}
        <link
          rel="icon"
          href="https://www.angrydynomiteslab.com/favicon.ico"
          type="image/x-icon"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
