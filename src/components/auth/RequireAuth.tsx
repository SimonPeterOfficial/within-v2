"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import LoadingState from "@/components/ui/states/LoadingState";

/**
 * Protected-route gate. Renders a cinematic loading veil while the session is
 * resolving, then redirects to /login (remembering the intended destination
 * via ?next=) if there's no session — or reveals the children once
 * authenticated. Server HTML always renders the loading state, so there are
 * no hydration mismatches and no server-side redirects.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <LoadingState label="Entering your sanctuary…" />
      </div>
    );
  }

  return <>{children}</>;
}
