import type { Metadata } from "next";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — WithIn",
  description: "Your universe is still here. Welcome back.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      {/* LoginForm reads ?next= from window.location at submit time, so it
          renders fully in the static HTML — no Suspense deferral needed. */}
      <LoginForm />
    </AuthSplitLayout>
  );
}
