import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://airportmatrix.com"),
  title: "AirportMatrix - Find Airport Parking Deals",
  description: "Compare and book airport parking options across the US. Find the best deals on long-term and short-term parking at JFK, LAX, Chicago, and more.",
  keywords: ["airport parking", "airport parking deals", "long term parking", "short term parking", "JFK parking", "LAX parking", "airport shuttle"],
  openGraph: {
    title: "AirportMatrix - Find Airport Parking Deals",
    description: "Compare and book airport parking options across the US",
    type: "website",
    locale: "en_US",
    siteName: "AirportMatrix",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AirportMatrix - Find Airport Parking Deals",
    description: "Compare and book airport parking options across the US",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
