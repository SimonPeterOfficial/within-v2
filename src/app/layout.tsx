import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FilmGrain from "@/components/effects/FilmGrain";
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
        <FilmGrain />
        {children}
      </body>
    </html>
  );
}
