import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login — WithIn",
  description: "Secure access to the WithIn administrative dashboard.",
};

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06060c] px-6">
      {/* Atmospheric background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(88,60,160,0.06),transparent_60%)]"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-white">
            Command Center
          </h1>
          <p className="mt-2 text-[13px] text-gray-500/60">
            Admin access — authorized personnel only.
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </main>
  );
}
