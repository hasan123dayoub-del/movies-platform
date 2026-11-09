import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist has no Arabic letters: Arabic titles, names and descriptions use this font instead
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Each page sets its own title; the template adds the site name after it
  title: { default: "Movies Platform", template: "%s · Movies Platform" },
  description: "Browse movies, their directors and the actors who star in them.",
  // Link previews (LinkedIn, WhatsApp...) need absolute image URLs. Pages without their
  // own poster use app/opengraph-image.jpg; without it, sites fall back to the favicon.
  metadataBase: new URL(process.env.SITE_URL ?? "https://movies-platform-web.onrender.com"),
  openGraph: { type: "website", siteName: "Movies Platform" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${arabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
