import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { turso } from "@/lib/db";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let ga4Id: string | null = null;
  try {
    const result = await turso.execute({
      sql: "SELECT value FROM site_settings WHERE key = 'ga4_measurement_id'",
      args: [],
    });
    if (result.rows.length > 0) {
      const v = String(result.rows[0].value).trim();
      if (v) ga4Id = v;
    }
  } catch { /* table might not exist yet */ }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {ga4Id && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            />
            <Script
              id="ga4-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${ga4Id}');`,
              }}
            />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
