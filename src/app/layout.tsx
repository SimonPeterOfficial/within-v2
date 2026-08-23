import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/theme";
import { EnvironmentProvider } from "@/lib/environment";
import CustomCursor from "@/components/effects/CustomCursor";
import GrainOverlay from "@/components/effects/GrainOverlay";
import PointerLight from "@/components/effects/PointerLight";
import PresenceField from "@/components/effects/PresenceField";
import MemoryRipple from "@/components/effects/MemoryRipple";
import UniverseTracker from "@/components/universe/UniverseTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The editorial display face — soft serif with a real italic axis. Headlines
// across the universe speak in Fraunces; body copy stays in Geist.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WithIn — Feel Seen. Feel Heard. Feel WithIn.",
  description:
    "A home for stories, emotions, creators and meaningful connections — a universe built around how you feel right now.",
  applicationName: "WithIn",
  openGraph: {
    title: "WithIn — Feel Seen. Feel Heard. Feel WithIn.",
    description:
      "A home for stories, emotions, creators and meaningful connections — a universe built around how you feel.",
    type: "website",
    siteName: "WithIn",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "WithIn — Feel Seen. Feel Heard. Feel WithIn.",
    description:
      "A home for stories, emotions, creators and meaningful connections."
  },
  keywords: ["stories", "emotions", "creators", "sanctuary", "community", "originals", "music"]
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <ThemeProvider>
          <EnvironmentProvider>
            <AuthProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-black"
              >
                Skip to content
              </a>
              {children}
              <GrainOverlay />
              <PresenceField />
              <PointerLight />
              <CustomCursor />
              <MemoryRipple />
              <UniverseTracker />
              <SpeedInsights />
            </AuthProvider>
          </EnvironmentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
