import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Knot & Found — Turn your materials into finished jewelry',
  description:
    'Upload photos of your beads, chains, and findings. Get AI-designed jewelry directions with material lists and making steps.',
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
