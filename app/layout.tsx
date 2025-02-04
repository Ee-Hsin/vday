import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Valentine Proposal',
  description: 'Be my valentine',
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
