import type { Metadata } from "next";
import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import LoginForm from "@/components/auth/LoginForm";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Log in — WithIn",
  description: "Your universe is still here. Welcome back.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      <LoginForm />
      <div className="mt-7 border-t border-[#262143]/12 pt-5">
        <p className="tagline-caps mb-4 text-center text-[8.5px]">Or continue with Clerk</p>
        <Link
          href="/clerk-sign-in"
          className="pill-glass w-full px-5 py-3 text-[13px] font-medium"
        >
          <Icon name="gem" size={14} />
          Sign in with Clerk
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
