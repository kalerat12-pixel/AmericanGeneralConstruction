import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/cart/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/config";

// Condensed grotesk for headlines, clean sans for body — loaded as variable
// fonts and self-hosted by next/font, so no render-blocking Google request.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Ghost Energy, ranked and stocked by lifters`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Ghost Energy",
    "Ghost Energy flavors ranked",
    "energy drink for the gym",
    "pre-workout energy drink",
    "bulk energy drinks for gyms",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Ghost Energy, ranked and stocked by lifters`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <a href="#main" className="sr-focusable">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
