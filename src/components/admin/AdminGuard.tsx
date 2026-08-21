"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingState from "@/components/ui/states/LoadingState";

/**
 * AdminGuard — client-side authorization gate for the admin area.
 *
 * Works alongside the server-side middleware:
 *   1. Middleware catches unauthenticated requests at the edge
 *   2. AdminGuard provides a client-side safety net for session expiration
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;

    const controller = new AbortController();

    fetch("/api/admin/verify", {
      method: "GET",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          router.replace("/admin/login");
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        // Network error — middleware already checked, assume valid
        setVerified(true);
      });

    return () => controller.abort();
  }, [isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060c]">
        <LoadingState label="Verifying access…" />
      </div>
    );
  }

  return <>{children}</>;
}
