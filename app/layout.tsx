import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Charmchemy — Made from maybe. Designed by AI. Crafted by you.',
  description:
    'AI-generated DIY jewelry design ideas from your existing beads, charms, chains, and findings.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
