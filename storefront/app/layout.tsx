import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import Navbar from "@/components/site/Navbar";
import CartDrawer from "@/components/site/CartDrawer";
import Footer from "@/components/site/Footer";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-src",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-src",
  display: "swap",
});

const SITE_URL = "https://lifting4gains.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lifting4Gains Research — The Future of Physical Optimization",
    template: "%s · Lifting4Gains Research",
  },
  description:
    "Research-grade peptides synthesized to a 99.5% purity floor, third-party verified by RP-HPLC and LC-MS, and shipped cold with a scannable certificate of analysis in every box. Research use only.",
  keywords: [
    "research peptides",
    "certificate of analysis",
    "HPLC verified",
    "third-party tested peptides",
    "Lifting4Gains",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Lifting4Gains Research",
    title: "The Future of Physical Optimization",
    description:
      "99.5% purity floor. Third-party HPLC + LC-MS on every lot. Certificate of analysis in every box. Research use only.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lifting4Gains Research",
    description:
      "Research-grade peptides with a published certificate of analysis on every lot.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#collection"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-acid focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#04140a]"
        >
          Skip to the collection
        </a>

        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
