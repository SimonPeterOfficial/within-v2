import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider, ClerkAuthWrapper } from "@/lib/auth/session";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/lib/theme";
import { EnvironmentProvider } from "@/lib/environment";
import CustomCursor from "@/components/effects/CustomCursor";
import GrainOverlay from "@/components/effects/GrainOverlay";
import PointerLight from "@/components/effects/PointerLight";
import PresenceField from "@/components/effects/PresenceField";
import MemoryRipple from "@/components/effects/MemoryRipple";
import UniverseTracker from "@/components/universe/UniverseTracker";
import RouteAtmosphere from "@/components/transitions/RouteAtmosphere";
import PortalTransition from "@/components/transitions/PortalTransition";
import Breath from "@/components/effects/Breath";
import ScrollProgress from "@/components/effects/ScrollProgress";
import PulseTrail from "@/components/effects/PulseTrail";
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
      "A home for stories, emotions, creators and meaningful connections.",
    type: "website",
    siteName: "WithIn",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "WithIn — Feel Seen. Feel Heard. Feel WithIn.",
    description:
      "A home for stories, emotions, creators and meaningful connections.",
  },
  keywords: [
    "stories",
    "emotions",
    "creators",
    "sanctuary",
    "community",
    "originals",
    "music",
  ],
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#050505" }],
};

const pageChildren = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-black"
    >
      Skip to content
    </a>
    <PortalTransition>{children}</PortalTransition>
    <GrainOverlay />
    <PresenceField />
    <PointerLight />
    <CustomCursor />
    <MemoryRipple />
    <UniverseTracker />
    <RouteAtmosphere />
    <Breath />
    <ScrollProgress />
    <PulseTrail />
    <SpeedInsights />
  </>
);

/**
 * Root layout with optional ClerkProvider.
 *
 * Clerk integration is conditional on NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY being
 * configured. When keys are missing, the legacy authentication system
 * continues to work unchanged — no Clerk dependency blocks the app.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <ThemeProvider>
          <EnvironmentProvider>
            {clerkConfigured ? (
              <ClerkProvider>
                <ClerkAuthWrapper>
                  <ToastProvider>{pageChildren({ children })}</ToastProvider>
                </ClerkAuthWrapper>
              </ClerkProvider>
            ) : (
              <AuthProvider>
                <ToastProvider>{pageChildren({ children })}</ToastProvider>
              </AuthProvider>
            )}
          </EnvironmentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
