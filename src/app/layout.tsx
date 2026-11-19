import type { Metadata, Viewport } from "next"

import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const title = "My Wall — a 2008-style Facebook wall"
const description =
  "Leave a note on Enrique's wall. A 2008-style Facebook wall built with React 19, Next.js 16, Supabase Realtime, Tailwind CSS and shadcn/ui."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "My Wall",
  authors: [{ name: "Enrique Ferolino" }],
  keywords: [
    "React",
    "Next.js",
    "Supabase",
    "Realtime",
    "Tailwind CSS",
    "shadcn/ui",
    "Facebook wall",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "My Wall",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b5998",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-b-[3px] bg-white px-3 py-2 text-[12px] font-bold text-fb-blue shadow-md focus:not-sr-only focus:absolute focus:left-2 focus:top-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
