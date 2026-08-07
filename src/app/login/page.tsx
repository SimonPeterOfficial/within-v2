import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — WithIn",
  description: "Welcome back to the world within.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      {/* LoginForm reads ?next= from window.location at submit time, so it
          renders fully in the static HTML — no Suspense deferral needed. */}
      <LoginForm />
    </AuthLayout>
  );
}
