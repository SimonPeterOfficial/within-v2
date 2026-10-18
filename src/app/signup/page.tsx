import type { Metadata } from "next";
import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — WithIn",
  description: "Create your place Within. A universe built around how you feel.",
};

export default function SignupPage() {
  return (
    <AuthSplitLayout>
      <SignupForm />
      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-500/50 mb-4">
          Or create with Clerk
        </p>
        <Link
          href="/clerk-sign-up"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[13px] font-medium text-white/70 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
        >
          <span className="text-base">🔑</span>
          Sign up with Clerk
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
