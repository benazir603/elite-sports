import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elite Sports - Badminton, Cricket & Sports Equipment | Chennai",
    template: "%s | Elite Sports",
  },
  description:
    "Shop badminton, cricket, football, fitness and sports equipment online at Elite Sports, Selaiyur, Chennai. Genuine gear, fast delivery across India.",
  keywords: [
    "sports equipment online India",
    "badminton racket online",
    "cricket bat online",
    "sports shop Chennai",
    "Elite Sports Selaiyur",
    "badminton accessories",
    "cricket equipment",
    "sports store Tambaram",
    "buy sports gear online",
    "Yonex badminton racket India",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    siteName: SITE_NAME,
    title: "Elite Sports - Badminton, Cricket & Sports Equipment",
    description:
      "Shop badminton, cricket, football, fitness and sports equipment online at Elite Sports, Selaiyur, Chennai.",
    url: SITE_URL,
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
