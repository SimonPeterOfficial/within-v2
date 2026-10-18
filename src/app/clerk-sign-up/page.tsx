"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Clerk sign-up page — only functional when Clerk keys are configured.
 * When Clerk is not configured, shows a graceful message and links back
 * to the legacy sign-up form.
 */

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export default function ClerkSignUpPage() {
  if (!clerkConfigured) {
    return (
      <div className="min-h-full flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-medium mb-4">
            Clerk sign-up not yet configured
          </h1>
          <p className="mb-6 text-gray-400">
            Please set up Clerk keys to use this sign-up method.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white hover:bg-white/[0.06]"
          >
            <span>←</span> Use legacy sign-up
          </Link>
        </div>
      </div>
    );
  }

  return <SignUp />;
}
