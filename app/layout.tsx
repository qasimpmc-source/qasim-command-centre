import type { Metadata } from 'next'
import { Inter, Fraunces, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })

export const metadata: Metadata = {
  title: 'Command Centre',
  description: 'Personal sanctuary for Dr Muhammad Qasim',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${grotesk.variable}`}>
      <body style={{ margin: 0, padding: 0, fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden', background: '#030308' }}>
        {children}
      </body>
    </html>
  )
}
