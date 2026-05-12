import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopDeliveryBar } from "@/components/site/top-delivery-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AgeGate } from "@/components/site/age-gate";
import { DemoNav } from "@/components/site/demo-nav";
import { AnalyticsScript } from "@/components/site/analytics-script";
import { ChromeGate } from "@/components/site/chrome-gate";
import { CartWarmup } from "@/components/site/cart-warmup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const showDemoNav =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_DEMO_NAV === "true";

export const metadata: Metadata = {
  title: {
    default: "Onelink — Premium delivery in Kingston",
    template: "%s · Onelink",
  },
  description:
    "Onelink delivers vapes, ZYN, lighters, drinks, snacks and more across Kingston in 15–30 minutes. One Link. Endless Possibilities.",
  icons: {
    icon: [{ url: "/brand/favicon-32.png", type: "image/png" }],
  },
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
      <body className="min-h-full flex flex-col">
        <AnalyticsScript />
        <CartWarmup />
        <ChromeGate>
          {showDemoNav && <DemoNav />}
          <TopDeliveryBar />
          <Header />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <Footer />
          <AgeGate />
        </ChromeGate>
      </body>
    </html>
  );
}
