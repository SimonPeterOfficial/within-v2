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
  title: "WithIn — A universe within you",
  description:
    "Stories, emotions, and people connecting in one place. A cinematic universe where every feeling has a home.",
  applicationName: "WithIn",
  openGraph: {
    title: "WithIn — A universe within you",
    description:
      "A cinematic sanctuary where stories, emotions, and people connect. Every feeling has a home.",
    type: "website",
    siteName: "WithIn",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "WithIn — A universe within you",
    description:
      "A cinematic sanctuary where stories, emotions, and people connect."
  },
  keywords: ["stories", "emotions", "sanctuary", "community", "originals"]
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#050505" }]
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
      <body className="min-h-full flex flex-col bg-black text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
