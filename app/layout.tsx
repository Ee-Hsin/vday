import type { Metadata } from "next"
import "./globals.css"
import { Analytics as NextJSAnalytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { fontFredoka, fontPoppins, fontNanumPen } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Valentine Proposal",
  description: "Be my valentine",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontFredoka.variable} ${fontPoppins.variable} ${fontNanumPen.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        {children}
        <NextJSAnalytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
